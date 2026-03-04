#!/bin/bash

echo "Starting Bug Smash Backend..."

cd src || exit

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

echo "Installing dependencies..."
pip install flask

echo "Running app..."
python3 app.py
