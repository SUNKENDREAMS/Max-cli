#!/bin/bash

# This script creates an alias for the Max Headroom CLI

# Determine the project directory
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
ALIAS_COMMAND="alias max-headroom='$PROJECT_DIR/scripts/start.sh'" # Updated alias name

# Detect shell and set config file path
if [[ "$SHELL" == *"/bash" ]]; then
    CONFIG_FILE="$HOME/.bashrc"
elif [[ "$SHELL" == *"/zsh" ]]; then
    CONFIG_FILE="$HOME/.zshrc"
else
    echo "Unsupported shell. Only bash and zsh are supported."
    exit 1
fi

echo "This script will add the following alias to your shell configuration file ($CONFIG_FILE):"
echo "  $ALIAS_COMMAND"
echo ""

# Check if the alias already exists
if grep -q "alias max-headroom=" "$CONFIG_FILE"; then # Updated alias name check
    echo "A 'max-headroom' alias already exists in $CONFIG_FILE. No changes were made." # Updated message
    exit 0
fi

read -p "Do you want to proceed? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$ALIAS_COMMAND" >> "$CONFIG_FILE"
    echo ""
    echo "Alias added to $CONFIG_FILE."
    echo "Please run 'source $CONFIG_FILE' or open a new terminal to use the 'max-headroom' command." # Updated command
else
    echo "Aborted. No changes were made."
fi
