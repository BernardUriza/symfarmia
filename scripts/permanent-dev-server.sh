#!/bin/bash

# Permanent Development Server Script
# Maintains a stable dev server on port 3002 for testing and reviews

PERMANENT_PORT=3002
PIDFILE="/tmp/symfarmia-permanent-dev.pid"
LOGFILE="/tmp/symfarmia-permanent-dev.log"

function start_server() {
    echo "🚀 Starting permanent dev server on port $PERMANENT_PORT..."
    
    # Kill existing server if running
    if [ -f "$PIDFILE" ]; then
        kill -9 $(cat "$PIDFILE") 2>/dev/null || true
        rm -f "$PIDFILE"
    fi
    
    # Start new server with TypeScript check disabled
    cd "$(dirname "$0")/.."
    SKIP_TYPE_CHECK=true PORT=$PERMANENT_PORT nohup npm run dev > "$LOGFILE" 2>&1 &
    echo $! > "$PIDFILE"
    
    # Wait for server to start
    sleep 5
    
    # Verify server is running
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PERMANENT_PORT | grep -q "200"; then
        echo "✅ Permanent dev server active: http://localhost:$PERMANENT_PORT"
        echo "📝 Logs: $LOGFILE"
        return 0
    else
        echo "❌ Failed to start permanent dev server"
        return 1
    fi
}

function stop_server() {
    echo "🛑 Stopping permanent dev server..."
    if [ -f "$PIDFILE" ]; then
        kill -9 $(cat "$PIDFILE") 2>/dev/null
        rm -f "$PIDFILE"
        echo "✅ Permanent dev server stopped"
    else
        echo "ℹ️ No permanent dev server running"
    fi
}

function status_server() {
    # Check if server is responding
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PERMANENT_PORT | grep -q "200"; then
        # Find the actual PID
        local actual_pid=$(netstat -tulpn 2>/dev/null | grep ":$PERMANENT_PORT " | awk '{print $7}' | cut -d'/' -f1)
        echo "✅ Permanent dev server active: http://localhost:$PERMANENT_PORT"
        if [ -n "$actual_pid" ]; then
            echo "📊 PID: $actual_pid"
            echo "$actual_pid" > "$PIDFILE"
        fi
    else
        echo "❌ Permanent dev server not running"
        rm -f "$PIDFILE" 2>/dev/null
    fi
}

function restart_server() {
    stop_server
    sleep 2
    start_server
}

function logs_server() {
    if [ -f "$LOGFILE" ]; then
        tail -f "$LOGFILE"
    else
        echo "❌ No log file found"
    fi
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        status_server
        ;;
    logs)
        logs_server
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Permanent Development Server Management"
        echo "Maintains stable dev server on port $PERMANENT_PORT"
        echo ""
        echo "Commands:"
        echo "  start   - Start permanent dev server"
        echo "  stop    - Stop permanent dev server"
        echo "  restart - Restart permanent dev server"
        echo "  status  - Check server status"
        echo "  logs    - Follow server logs"
        exit 1
        ;;
esac