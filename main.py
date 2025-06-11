
import os
import yfinance as yf
from supabase import create_client, Client
from datetime import timezone
from flask import Flask, jsonify, request
from dotenv import load_dotenv
import logging
import traceback
import sys
import time

# --- Basic Configuration ---
# Set up basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout) # Ensure logs go to stdout for container environments
    ]
)

# Load environment variables from a .env file for local development
if load_dotenv():
    logging.info("Successfully loaded .env file.")
else:
    logging.info("No .env file found or it is empty. Relying on system environment variables.")

app = Flask(__name__)

# --- Supabase Initialization ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role Key for backend operations

supabase_client: Client | None = None
if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("CRITICAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.")
    # For task/loop mode, exit if Supabase can't be initialized. Flask will fail at endpoint calls.
    if __name__ == "__main__" and (len(sys.argv) > 1 and sys.argv[1] in ['task', 'loop'] or len(sys.argv) == 1):
        sys.exit("Exiting: Supabase credentials not found.")
else:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logging.info("Supabase client initialized successfully.")
    except Exception as e:
        logging.error(f"Failed to initialize Supabase client: {e}")
        logging.error(traceback.format_exc())
        if __name__ == "__main__" and (len(sys.argv) > 1 and sys.argv[1] in ['task', 'loop'] or len(sys.argv) == 1):
            sys.exit("Exiting: Supabase client initialization failed.")


# --- Market Data Configuration ---
# Symbols to fetch: Name for logging/display, Ticker for yfinance
SYMBOLS_CONFIG = [
    {"name": "Gold Futures", "ticker": "GC=F"},
    {"name": "US Dollar Index", "ticker": "DX-Y.NYB"},
    {"name": "Crude Oil Futures", "ticker": "CL=F"},
    {"name": "VIX", "ticker": "^VIX"},
]
DEFAULT_SYMBOL_FOR_LATEST = "GC=F" # Default for /latest endpoint if no symbol is provided

INTERVAL = "1m"    # 1-minute interval
TABLE_NAME = "market_data" # Supabase table name

def fetch_and_upsert_candle(symbol_ticker: str, symbol_name: str) -> tuple[dict | None, str | None]:
    """
    Fetches the latest completed 1-minute candle for a given symbol from Yahoo Finance
    and upserts it into the Supabase table.
    Returns (candle_data, None) on success, or (None, error_message) on failure.
    """
    if not supabase_client:
        message = "Supabase client not initialized. Cannot fetch or upsert candle."
        logging.error(message)
        return None, message

    logging.info(f"Fetching latest data for {symbol_name} ({symbol_ticker})")
    try:
        # 1. Fetch the last 5 minutes of data to reliably get the last completed candle.
        ticker_obj = yf.Ticker(symbol_ticker)
        # auto_adjust=False by default, prepost=False to exclude pre/post market
        data = ticker_obj.history(period="5m", interval=INTERVAL, prepost=False)

        if data.empty or len(data) < 2:
            message = f"Not enough data returned from yfinance for {symbol_name} ({symbol_ticker}) (len: {len(data)}). Cannot determine the last closed candle."
            logging.warning(message)
            return None, message

        # 2. The second-to-last record (-2) is the most recently *completed* 1-minute candle.
        last_closed_candle = data.iloc[-2]
        timestamp_pd = last_closed_candle.name # This is a pandas Timestamp

        # 3. Prepare the data payload
        # Convert pandas Timestamp to Python datetime object, then to UTC ISO 8601 string
        dt_utc = timestamp_pd.tz_convert(timezone.utc).to_pydatetime()
        time_iso_utc = dt_utc.isoformat()

        candle_data = {
            "symbol": symbol_ticker, # Store the ticker as the symbol identifier
            "time": time_iso_utc, # Primary key component, TIMESTAMPTZ
            "open": round(float(last_closed_candle["Open"]), 2),
            "high": round(float(last_closed_candle["High"]), 2),
            "low": round(float(last_closed_candle["Low"]), 2),
            "close": round(float(last_closed_candle["Close"]), 2),
            "volume": int(last_closed_candle.get("Volume", 0)),
            # 'created_at' will be handled by Supabase default
        }
        
        # 4. Upsert the data into the Supabase table.
        logging.info(f"Upserting candle to Supabase for {symbol_name} ({symbol_ticker}) at time: {time_iso_utc}")
        response = supabase_client.table(TABLE_NAME).upsert(
            candle_data,
            on_conflict='symbol,time' 
        ).execute()

        if hasattr(response, 'error') and response.error:
            logging.error(f"Supabase upsert error for {symbol_name} ({symbol_ticker}): {response.error.message if response.error else 'Unknown error'}")
            return None, str(response.error.message if response.error else 'Unknown Supabase upsert error')
        
        if not hasattr(response, 'data') or (hasattr(response, 'data') and not response.data and not (hasattr(response, 'error') and response.error)):
             logging.warning(f"Supabase upsert for {symbol_name} ({symbol_ticker}) at {time_iso_utc} returned no data, but no explicit error. This may be normal for upsert with 'minimal' return preference.")
             
        logging.info(f"Upsert successful for {symbol_name} ({symbol_ticker}) at {time_iso_utc}. Response data (if any): {response.data if hasattr(response, 'data') else 'N/A'}")
        return candle_data, None

    except Exception as e:
        logging.error(f"An error occurred during fetch or upsert for {symbol_name} ({symbol_ticker}): {e}")
        logging.error(traceback.format_exc())
        return None, str(e)

# --- Flask API Endpoints ---

@app.route("/stream", methods=["GET"])
def stream_candle_endpoint():
    """
    API endpoint to trigger fetching the latest candle for all configured symbols
    and pushing them to Supabase.
    """
    if not supabase_client:
        return jsonify({"success": False, "error": "Supabase client not initialized."}), 500
    
    results = []
    overall_success = True
    for item in SYMBOLS_CONFIG:
        candle, error = fetch_and_upsert_candle(item["ticker"], item["name"])
        if error:
            overall_success = False
            results.append({"symbol": item["ticker"], "name": item["name"], "success": False, "error": error, "data": None})
        else:
            results.append({"symbol": item["ticker"], "name": item["name"], "success": True, "data": candle})

    if not overall_success:
        # If any symbol failed, consider the overall operation partially failed or fully failed
        # For simplicity, returning a 207 Multi-Status like response might be more accurate,
        # but a 500 if any critical error, or 200 with detailed results.
        # Let's return 200 but indicate partial success within the message.
        return jsonify({
            "success": False, # Reflects that not all operations were successful
            "message": "Attempted to fetch and upsert candles for all symbols. Some operations may have failed.",
            "results": results
        }), 200 # Or 500 if any error is considered critical enough to fail the whole request

    return jsonify({
        "success": True,
        "message": "Successfully fetched and upserted candles for all configured symbols.",
        "results": results
    }), 200

@app.route("/", methods=["GET"])
def root_stream_endpoint():
    """ Alias the root path to the stream endpoint for convenience """
    return stream_candle_endpoint()


@app.route("/latest", methods=["GET"])
def get_latest_candle_endpoint():
    """
    API endpoint to retrieve the most recent candle for a given symbol from Supabase.
    Symbol can be passed as a query parameter `?symbol=TICKER`.
    Defaults to DEFAULT_SYMBOL_FOR_LATEST if not provided.
    """
    if not supabase_client:
        return jsonify({"success": False, "error": "Supabase client not initialized."}), 500

    target_symbol = request.args.get('symbol', DEFAULT_SYMBOL_FOR_LATEST)
    
    # Validate if the requested symbol is in our configured list, optional
    is_configured_symbol = any(s_config['ticker'] == target_symbol for s_config in SYMBOLS_CONFIG)
    if not is_configured_symbol:
         logging.warning(f"Requested symbol {target_symbol} is not in the configured list. Proceeding anyway.")
         # Or return an error:
         # return jsonify({"success": False, "error": f"Symbol {target_symbol} is not configured for tracking."}), 400


    logging.info(f"Fetching latest candle for {target_symbol} from Supabase.")
    try:
        response = supabase_client.table(TABLE_NAME).select("*") \
            .eq('symbol', target_symbol) \
            .order('time', desc=True) \
            .limit(1) \
            .maybe_single() \
            .execute() 
        
        if hasattr(response, 'error') and response.error:
            logging.error(f"Supabase select error for {target_symbol}: {response.error.message}")
            return jsonify({"success": False, "error": str(response.error.message), "data": None}), 500

        if not response.data:
            logging.warning(f"No records found in {TABLE_NAME} for symbol {target_symbol}.")
            return jsonify({"success": True, "message": f"No records found for symbol {target_symbol}", "data": None}), 200 

        return jsonify({"success": True, "message": f"Latest candle retrieved for {target_symbol}.", "data": response.data}), 200

    except Exception as e:
        logging.error(f"Failed to retrieve latest candle for {target_symbol}: {e}")
        logging.error(traceback.format_exc())
        return jsonify({"success": False, "error": str(e), "data": None}), 500


@app.route("/health", methods=["GET"])
def health_check_endpoint():
    """A simple health check endpoint to confirm the server is running and DB connection."""
    db_status = "ok"
    if not supabase_client:
        db_status = "error: Supabase client not initialized"
    else:
        try:
            # Test connection by trying to get a non-existent table's schema or a very small query
            supabase_client.table(TABLE_NAME).select("symbol", count='exact').limit(0).execute()
        except Exception as e:
            db_status = f"error: Supabase connection test failed - {str(e)}"
            logging.warning(f"Health check: Supabase connection test failed: {e}")

    return jsonify({"status": "ok", "database_status": db_status }), 200


# --- Execution Modes ---
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == 'task':
        # --- One-off Task Mode ---
        logging.info("Running as a one-off task for all configured symbols.")
        if not supabase_client: 
            logging.error("Supabase client not initialized. Task cannot run.")
            sys.exit(1)
        
        overall_task_success = True
        for item_config in SYMBOLS_CONFIG:
            candle, error = fetch_and_upsert_candle(item_config["ticker"], item_config["name"])
            if error:
                overall_task_success = False
                logging.error(f"Task failed for {item_config['name']} ({item_config['ticker']}): {error}")
            else:
                logging.info(f"Task completed successfully for {item_config['name']} ({item_config['ticker']}). Candle: {candle}")
        
        if not overall_task_success:
            logging.error("One or more symbols failed during the task.")
            sys.exit(1)
        
        logging.info("All symbols processed in one-off task.")
        sys.exit(0)

    elif len(sys.argv) == 1 or (len(sys.argv) > 1 and sys.argv[1] == 'loop'):
        # --- Loop Mode (Default if no args or 'loop' arg) ---
        if len(sys.argv) == 1:
            logging.info("No arguments provided, defaulting to loop mode. Fetching every 5 minutes for all symbols.")
        else: # sys.argv[1] == 'loop'
             logging.info("Running in loop mode. Fetching every 5 minutes for all symbols.")

        if not supabase_client:
            logging.error("Supabase client not initialized. Loop mode cannot start.")
            sys.exit(1)
        
        FETCH_INTERVAL_SECONDS = 300 # 5 minutes
        try:
            while True:
                logging.info("Loop: Starting fetch and upsert cycle for all symbols.")
                for item_config in SYMBOLS_CONFIG:
                    candle, error = fetch_and_upsert_candle(item_config["ticker"], item_config["name"])
                    if error:
                        logging.error(f"Loop: Cycle failed for {item_config['name']} ({item_config['ticker']}) - {error}")
                    else:
                        logging.info(f"Loop: Cycle completed for {item_config['name']} ({item_config['ticker']}). Candle: {candle}")
                    time.sleep(1) # Small delay between fetching different symbols to avoid hitting API rate limits too quickly
                
                logging.info(f"Loop: All symbols processed. Sleeping for {FETCH_INTERVAL_SECONDS} seconds.")
                time.sleep(FETCH_INTERVAL_SECONDS)
        except KeyboardInterrupt:
            logging.info("Loop mode interrupted by user. Exiting.")
            sys.exit(0)
        except Exception as e:
            logging.error(f"Loop mode encountered an unrecoverable error: {e}")
            logging.error(traceback.format_exc())
            sys.exit(1)
            
    elif len(sys.argv) > 1 and sys.argv[1] == 'server':
        # --- Flask Server Mode (explicit 'server' argument) ---
        if not supabase_client:
            logging.warning("Supabase client not initialized. Flask server starting, but DB operations will fail.")
        
        port = int(os.getenv("PORT", 8080))
        logging.info(f"Starting Flask web server on port {port} (explicit 'server' argument). Use Gunicorn for production.")
        # For production, use a WSGI server like Gunicorn:
        # gunicorn main:app -w 4 -b 0.0.0.0:$PORT
        app.run(host='0.0.0.0', port=port, debug=False) # debug=False for server mode
    else:
        logging.warning(f"Invalid arguments: {sys.argv[1:]}")
        logging.info("Usage: python main.py [task|loop|server]")
        logging.info("Defaulting to loop mode if no arguments are provided.")
        sys.exit("Invalid arguments. Use 'task', 'loop', or 'server'. No argument defaults to 'loop'.")


    