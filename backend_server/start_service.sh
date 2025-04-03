#!/bin/bash

# Start the VectorStoreServer
python3 rag/ragServer.py &

# Start the first Streamlit app on port 8501
streamlit run graph.py --server.port=8501 &

# Start the second Streamlit app on port 8502
streamlit run graph_websockets.py --server.port=8502 &

# Start the Python script
python3 -m uvicorn sec_uploader:app --host 0.0.0.0 --port 8156 &

# Start the FastAPI server with the /ask endpoint on port 5091
python3 -m uvicorn graph_websockets:appFAPI --host 0.0.0.0 --port 5091 &

# Keep the container running
tail -f /dev/null