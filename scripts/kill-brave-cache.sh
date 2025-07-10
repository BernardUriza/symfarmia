#!/bin/bash
# 🦁 BRAVE CACHE NUCLEAR DESTRUCTION SCRIPT - BASH VERSION

echo "🔥 DESTROYING BRAVE CACHE - BASH EDITION..."

# Determine OS
OS=$(uname -s)
HOME_DIR=$(eval echo ~)

echo "🖥️  Operating System: $OS"
echo "🏠 Home Directory: $HOME_DIR"

# Function to safely remove directory
safe_remove() {
    local path="$1"
    if [ -d "$path" ] || [ -f "$path" ]; then
        rm -rf "$path" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "  ✅ Destroyed: $path"
        else
            echo "  ❌ Failed to destroy: $path"
        fi
    fi
}

# Destroy Next.js cache first
echo "🔥 Destroying Next.js cache..."
safe_remove ".next"
safe_remove "node_modules/.cache"
safe_remove ".cache"

# Platform-specific Brave cache destruction
case "$OS" in
    "Darwin")
        echo "🍎 Destroying macOS Brave cache..."
        
        # Brave cache directories on macOS
        safe_remove "$HOME_DIR/Library/Application Support/BraveSoftware/Brave-Browser/Default/Cache"
        safe_remove "$HOME_DIR/Library/Application Support/BraveSoftware/Brave-Browser/Default/Code Cache"
        safe_remove "$HOME_DIR/Library/Application Support/BraveSoftware/Brave-Browser/Default/GPUCache"
        safe_remove "$HOME_DIR/Library/Application Support/BraveSoftware/Brave-Browser/Default/Service Worker"
        safe_remove "$HOME_DIR/Library/Caches/BraveSoftware/Brave-Browser"
        safe_remove "$HOME_DIR/Library/Caches/com.brave.Browser"
        safe_remove "$HOME_DIR/Library/Application Support/BraveSoftware/Brave-Browser/Default/Local Storage"
        safe_remove "$HOME_DIR/Library/Application Support/BraveSoftware/Brave-Browser/Default/Session Storage"
        ;;
        
    "Linux")
        echo "🐧 Destroying Linux Brave cache..."
        
        # Brave cache directories on Linux
        safe_remove "$HOME_DIR/.config/BraveSoftware/Brave-Browser/Default/Cache"
        safe_remove "$HOME_DIR/.config/BraveSoftware/Brave-Browser/Default/Code Cache"
        safe_remove "$HOME_DIR/.config/BraveSoftware/Brave-Browser/Default/GPUCache"
        safe_remove "$HOME_DIR/.config/BraveSoftware/Brave-Browser/Default/Service Worker"
        safe_remove "$HOME_DIR/.cache/BraveSoftware/Brave-Browser"
        safe_remove "$HOME_DIR/.config/BraveSoftware/Brave-Browser/Default/Local Storage"
        safe_remove "$HOME_DIR/.config/BraveSoftware/Brave-Browser/Default/Session Storage"
        ;;
        
    *)
        echo "🌐 Generic cache destruction for $OS..."
        safe_remove ".next"
        safe_remove "node_modules/.cache"
        safe_remove ".cache"
        safe_remove "dist"
        safe_remove "build"
        ;;
esac

echo ""
echo "🦁 BRAVE CACHE NUCLEAR DESTRUCTION COMPLETE!"
echo "💡 For development in Brave:"
echo "   1. Open Developer Tools (F12)"
echo "   2. Network tab → Check 'Disable cache'"
echo "   3. Disable Brave Shields for localhost"
echo "   4. Use Ctrl+Shift+R for hard reload"
echo "   5. Or use Incognito mode"