## Prerequisites

- **Python 3.10** (recommended)
- API keys for any necessary integrations, stored in a `.env` file

## OPTION 1: Set up the project locally

### 2. Install Required Libraries
```bash
npm install
cd backend_server
pip install -r requirements.txt
pip install -r requirements2.txt
```

### 3. Configure Environment Variables
- Add the necessary API keys in a .env file in the root directory.

### 4. Navigate to the `rag` Directory
```bash
cd rag
```

### 5. Setup Google Drive Integration
Our implementation uses Google Drive to store documents, accessed via a Pathway connector.
- Upload your files for the VectorStoreServer in a Google Drive folder and provide the object ID of that folder in the `.env` file under the key `GDRIVE_FOLDER_OBJECT_ID`
- Add your Google Drive API credentials in `/backend_server/rag/credentials.json`
- Add the same credentials to `/backend_server/credentials.json`

### 7. Run the VectorStoreServer
Start the server using 
```bash
python ragServer.py
```
- The server runs in INFO logging mode by default in port `127.0.0.1:8011/`
- Note: The VectorStoreServer setup time varies based on document volume. It uses Unstructured’s High Resolution Parser with Agentic Chunking (details are available in the report). During our testing a 80 page doc (10k report) took 30 minutes on average to setup.

### 8. Run backend and web sockets port
- In another terminal, navigate to the `/backend_server` directory
- Run `graph_websockets.py` which tunes in 'Chat Mode' for querying our robust RAG system. 
```bash
cd /backend_server/
python graph_websockets.py
```
- In another terminal, navigate to `/backend_server` and run `graph.py` which is for the 'Report Mode' and renders DueDiligence reports.
- It is recommended to keep the Streamlit interface open in the browser while running the frontend for smooth functionality.

```bash
cd /backend_server/
streamlit run graph.py 
```
- **(Optional , in case you want to upload a file to the drive)** Run `sec_uploader.py` which is for the server which manages the upload of the file from local storage to Google Drive.
or inputs the Ticker name and the year and extracts it from 10K reports for the RAG Agent dynamically.

```bash
python sec_uploader.py
```

### 9. Run frontend  
- In another terminal, navigate to the root directory `/`
- Run the next frontend server.
- This exposes a port `localhost:3000` open it in preferably a 'Chromium' based browser like Google Chrome or Brave.

```bash
npm run dev
```


## OPTION 2: Set up using Docker 

### 1. Clone and Navigate to the Project Directory
### 2. Build the Docker Image
The Docker image is used to run the backend and websocket processes

```bash
sudo docker build -t pathway_chatbot ./
```
### 3. Run the Docker Image
This exposes all the backend and web socket endpoints
```bash
sudo docker run -it -p 8011:8011 -p 7771:7771 -p 7770:7770 -p 8501:8501 -p 8502:8502 -p 5091:5091 -p 8156:8156 pathway_chatbot
```

### 4. Run the frontend
From the root directory install node modules and start the client server at `localhost:3000`

```bash
npm install 
npm run dev
```
## Instructions 

- In your browser, navigate to `localhost:3000` to access the home page of , which defaults to the `Chat-Mode`.  
- Enter your queries in the input box provided and proceed to chat with our RAG Agent powered by Pathway.  
- Users have the option to upload files to Google Drive, provided `sec_uploader.py` is running.  
- By selecting the toggle button, the user switches to `Report-Mode`. 
- It is recommended to keep the Streamlit interface `localhost:8501` open in the browser while running the frontend for smooth functionality.

- Enter the company name in the input box provided at the bottom of the page.  

- This triggers the creation of the Financial Due Diligence (FDD) Report via three agents: the Key Metrics Agent, the Executive Agent, and the Business Agent.  
- The results from each agent can be viewed in real-time by toggling between Modes or the *Answer* tab, which displays the final answer.  
- Once the final answer is obtained, the FDD Report is generated locally, and the `Dashboard` option is activated.  
- Navigating to `localhost:3000/dashboard` or clicking the *Dashboard* option renders an interactive company dashboard showing key metrics, market penetration on a map, and other detailed insights.  
- The `Final_report_gen.pdf` file, which contains the Financial Due Diligence Report, is saved locally to the `/backend_server` directory. 
- If using Docker, the report will be saved in the container's volume with the same name.  
