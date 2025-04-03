import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import generateSVG from "../public/img/svgs/generate.svg";
import gradeDocsSVG from "../public/img/svgs/grade_docs.svg";
import webSearchSVG from "../public/img/svgs/web_search.svg";
import transformQuerySVG from "../public/img/svgs/transform_query.svg";
import financeAgentSVG from "../public/img/svgs/finance_agent.svg";
import reasoningAgentSVG from "../public/img/svgs/reasoning_agent.svg";
import endSVG from "../public/img/svgs/end.svg";
import sqlAgentSVG from "../public/img/svgs/sql_agent.svg"
import retrieveSVG from "../public/img/svgs/retrieve.svg";
import startSVG from "../public/img/svgs/start.svg";


import BeenhereIcon from "@mui/icons-material/Beenhere";

import { useRefreshContext } from "../context/VarContext";

import "./Answer.css";

import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import MarkdownDisplay from "./MarkdownDisplay";
import { Roboto_Mono } from 'next/font/google';

const SOCKET_SERVER_URL = "http://localhost:7771"; // Update to your backend's URL

let i = 0;

interface AnswerProps {
  answer: string;
}

// Initialize the font
const robotoMono = Roboto_Mono({ subsets: ['latin'] });

// Add this helper function at the top of your component
const formatAnswer = (text: string) => {
  if (!text) return '';

  // Define patterns to make bold
  const patterns = [
    // Make "Answer:" or "Response:" bold at the start
    {
      regex: /^(Answer|Response):/gm,
      replacement: '**$1:**'
    },
    // Make numbers with units bold
    {
      regex: /(\d+(?:\.\d+)?(?:\s*(?:GB|MB|KB|bytes|ms|seconds|minutes|hours|days))\b)/g,
      replacement: '**$1**'
    },
    // Make important technical terms bold
    {
      regex: /(SQL|API|REST|GraphQL|HTTP|URL|URI|JSON|XML|TCP|IP|DNS|HTTPS?)\b/g,
      replacement: '**$1**'
    },
    // Make file paths or file names bold
    {
      regex: /(`[\w\/\.-]+\.[a-zA-Z]+`)/g,
      replacement: '**$1**'
    },
    // Make key findings or conclusions bold
    {
      regex: /(Key findings:|In conclusion:|To summarize:|Therefore,|As a result,)/g,
      replacement: '**$1**'
    },
    // Make important status messages bold
    {
      regex: /(Success:|Error:|Warning:|Note:|Important:)/g,
      replacement: '**$1**'
    }
  ];

  // Apply all patterns
  let formattedText = text;
  patterns.forEach(({ regex, replacement }) => {
    formattedText = formattedText.replace(regex, replacement);
  });

  return formattedText;
};

export default function Answer({ answer }: AnswerProps) {
  console.log("Answer component received prop:", answer);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [subQueryArray, setSubQueryArray] = useState<string[]>([]);
  // const [subQueryEnd, setSubQueryEnd] = useState("");
  const [answer2, setAnswer2] = useState(answer);
  const [atNode, setAtNode] = useState("start");
  const [processedSubQueryArray, setProcessedSubQueryArray] = useState<string[]>([]);
  const [SubQueryQueue, setSubQueryQueue] = useState<string[]>([]);
  const [currentSubQuery, setCurrentSubQuery] = useState("");

  // const [time, setTime] = useState(0); // State to track the time
  // const [isRunning, setIsRunning] = useState(false);

  const { refreshVar, setrefreshVar } = useRefreshContext();

  const [subqueryNodeMap, setSubqueryNodeMap] = useState<Map<string, string[]>>(
    new Map(),
  );

  const [subqueryStatusMap, setSubqueryStatusMap] = useState<
    Map<string, string>
  >(new Map());

  const [handlingStatus, setHandlingStatus] = useState(false);

  const [isAllSubsProcessed, setIsAllSubsProcessed] = useState("nope");

  // Add this new state to track if we're actually processing queries
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to add new values to an existing key or create a new key
  const addValuesToKey = (key: string, newValues: string) => {
    setSubqueryNodeMap((prevMap) => {
      // Get the current values for the key (or an empty array if key doesn't exist)
      const currentValues = prevMap.get(key) || [];

      // Merge the current values with new values
      const updatedValues = [...currentValues, newValues];

      // Create a new Map with the updated values for the key
      return new Map(prevMap.set(key, updatedValues));
    });
  };

  const subqueryStatusMapSet = (key: string, newval: string) => {
    setSubqueryStatusMap((prevMap) => {
      // Get the current values for the key (or an empty array if key doesn't exist)
      const currentValues = prevMap.get(key) || [];

      // Create a new Map with the updated values for the key
      return new Map(prevMap.set(key, newval));
    });
  };

  useEffect(() => {
    if (refreshVar == "ready") {
      setSubqueryNodeMap(new Map());
      setSubqueryStatusMap(new Map());
      setAnswer2("");
      setHandlingStatus(false);
      setIsProcessing(false);
      setIsAllSubsProcessed("nope");
      setSubQueryArray([]);
      setAtNode("start");
    }
    if (refreshVar == "stoppedResponse") {
      setSubqueryNodeMap(new Map());
      setSubqueryStatusMap(new Map());
      setAnswer2("");
      setHandlingStatus(false);
      setIsProcessing(false);
      setIsAllSubsProcessed("nope");
      setSubQueryArray([]);
      setAtNode("start");
    }
  }, [refreshVar]);

  useEffect(() => {
    // let interval: NodeJS.Timeout | null = null;
    // if (isRunning) {
    //   interval = setInterval(() => {
    //     setTime((prevTime) => prevTime + 1); // Increment time by 1 every second
    //   }, 1000); // Update every 1000 ms (1 second)
    // } else if (!isRunning && time !== 0) {
    //   if (interval) clearInterval(interval); // Clear the interval when the stopwatch stops
    // }

    // Connect to the Socket.IO server
    const socket = io(SOCKET_SERVER_URL);

    // Listen for messages from the backend
    socket.on("message_to_frontend_subquery_array", (data) => {
      // setIsRunning(true);
      data = JSON.parse(data);
      setSubQueryArray(data);
      setIsProcessing(true); // Start processing when we get queries
      setHandlingStatus(false);
    });

    socket.on("message_to_frontend_subquery_start", (data) => {
      const sub_query = JSON.parse(data);
      subqueryStatusMapSet(sub_query, "loading");
      setCurrentSubQuery(data);
      setHandlingStatus(true);
      setIsProcessing(true);
      setSubQueryQueue((prevStack) => [...prevStack, data]);
    });

    socket.on("message_to_frontend_subquery_end", (data) => {
      data = JSON.parse(data);
      const { sub_query } = data;
      subqueryStatusMapSet(sub_query, "done");
      setHandlingStatus(true); // Keep handling true as we're still processing
    });

    socket.on("message_to_frontend_atnode", (data) => {
      setHandlingStatus(true);
      data = JSON.parse(data);

      console.log("xxxx", data);

      const { sub_query, node } = data;

      setAtNode(node);
      setMessages((prevMessages) => [...prevMessages, data]);
      addValuesToKey(sub_query, node);
    });

    socket.on("message_to_frontend_answer", (data) => {
      setIsAllSubsProcessed("generatedAnswer");
      console.log("Socket.IO answer received:", data);
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        setrefreshVar("generated");
        setAtNode("start");
        
        // Extract the answer text
        let finalAnswer = typeof parsedData === 'string' ? parsedData : 
                         parsedData["final ans"] || parsedData.answer || JSON.stringify(parsedData);
        
        // Format the answer with bold sections
        finalAnswer = formatAnswer(finalAnswer);
        
        setAnswer2(finalAnswer);
        setMessages((prevMessages) => [...prevMessages, parsedData]);
        setIsProcessing(false);
      } catch (e) {
        // console.error("Error processing Socket.IO answer:", e);
      }
    });

    socket.on("message_to_frontend_all_subs_processed", (data) => {
      setIsAllSubsProcessed("done");
      setIsProcessing(false);
    });

    // Also reset handling status when component unmounts
    return () => {
      setIsProcessing(false);
      setHandlingStatus(false);
      socket.disconnect();
    };
  }, []);

  // Add this effect to reset handling status when refreshVar changes
  useEffect(() => {
    if (refreshVar === "ready" || refreshVar === "stoppedResponse") {
      setHandlingStatus(false);
    }
  }, [refreshVar]);

  useEffect(() => {
    console.log("Answer prop changed to:", answer);
    if (answer && answer !== "Processing question...") {
      setAnswer2(answer);
    }
  }, [answer]);

  const arr = [
    startSVG,
    webSearchSVG,
    generateSVG,
    transformQuerySVG,
    retrieveSVG,
    gradeDocsSVG,
    financeAgentSVG,
    reasoningAgentSVG,
    endSVG,sqlAgentSVG,
  ];

  const [myMap, setMyMap] = useState<{ [key: string]: any }>({
    start: startSVG,
    web_search: webSearchSVG,
    generate: generateSVG,
    transform_query: transformQuerySVG,
    retrieve: retrieveSVG,
    grade_documents: gradeDocsSVG,
    finance_agent: financeAgentSVG,
    reasoning_agent: reasoningAgentSVG,
    end: endSVG,
    sql_agent: sqlAgentSVG,
  });

  const [ctr, setCounter] = useState(0);

  const markdown = `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
`;

  return (
    <div className="mx-auto my-24 flex h-auto w-[98%] shrink-0 flex-col gap-4 rounded-3xl bg-[#212121] p-5 lg:p-10">
      {/* Top section - Original Graph */}
      <div className="flex justify-between gap-5">
            <Image 
          src={myMap[atNode]} 
          height={700} 
          alt="please try again" 
        />

        {/* Right side - Answer */}
        <div className="w-[700px] rounded-2xl bg-[#1a1a1a] p-7 border border-[#333333] shadow-lg overflow-y-auto">
          <div className="mb-6 flex items-center justify-between pb-3 border-b border-[#333333]">
            <div className="flex gap-4 items-center">
              <Image
                unoptimized
                src="/img/Info.svg"
                alt="info"
                width={28}
                height={28}
                className="block lg:hidden"
              />
              <h3 className="text-[24px] font-bold uppercase text-[#f5f5f5] tracking-wide">
                Answer
              </h3>
            </div>
            {answer2 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(answer2.trim());
                    toast("Answer copied to clipboard", {
                      icon: "✂️",
                      style: { 
                        backgroundColor: "#1a1a1a", 
                        color: "#f5f5f5",
                        border: '1px solid #333333',
                        fontWeight: 500
                      },
                    });
                  }}
                  className="p-2 hover:bg-[#252525] rounded-full transition-colors duration-200"
                >
                  <Image
                    unoptimized
                    src="/img/copy.svg"
                    alt="copy"
                    width={22}
                    height={22}
                    className="cursor-pointer opacity-75 hover:opacity-100"
                  />
                </button>
              </div>
            )}
          </div>

          <div className={`w-full whitespace-pre-wrap leading-relaxed ${robotoMono.className}`}>
            {answer2 || answer ? (
              <div className="prose prose-invert max-w-none">
                <MarkdownDisplay 
                  content={answer2 || answer} 
                  className="text-[#f5f5f5] text-[16px] leading-[1.8]
                    [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:text-[#f5f5f5]
                    [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:text-[#f5f5f5]
                    [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-[#f5f5f5]
                    [&>p]:mb-4 [&>p]:text-[#dddddd]
                    [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-4 [&>ul]:text-[#dddddd]
                    [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:mb-4 [&>ol]:text-[#dddddd]
                    [&>code]:bg-[#2a2a2a] [&>code]:p-1 [&>code]:rounded [&>code]:text-[#63b3ed]
                    [&>pre]:bg-[#2a2a2a] [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:mb-4
                    [&>blockquote]:border-l-4 [&>blockquote]:border-[#404040] [&>blockquote]:pl-4 [&>blockquote]:italic
                    [&>a]:text-blue-400 [&>a]:underline [&>a]:hover:text-blue-300
                    [&>strong]:font-bold [&>strong]:text-[#f5f5f5] [&>strong]:bg-opacity-10 [&>strong]:bg-white [&>strong]:px-1 [&>strong]:rounded
                    [&>em]:italic [&>em]:text-[#dddddd]"
                />
              </div>
            ) : (
              <div className="flex w-full flex-col gap-3">
                <div className="h-6 w-full animate-pulse rounded-md bg-[#252525]" />
                <div className="h-6 w-3/4 animate-pulse rounded-md bg-[#252525]" />
                <div className="h-6 w-5/6 animate-pulse rounded-md bg-[#252525]" />
                <div className="h-6 w-full animate-pulse rounded-md bg-[#252525]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section - Sub Queries Handling */}
      <div className="w-full mt-8 rounded-2xl bg-[#1a1a1a] p-7 border border-[#333333] shadow-lg">
        <div className="mb-6 flex items-center justify-between pb-3 border-b border-[#333333]">
          <div className="flex gap-4 items-center">
            <h3 className="text-[24px] font-bold uppercase text-[#f5f5f5] tracking-wide">
              Processing Logs
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left column - Sub Queries List */}
          <div className="bg-[#212121] rounded-xl p-5">
            <h4 className="text-[18px] font-semibold text-[#f5f5f5] mb-4">
              Sub Queries to be Handled
            </h4>
            <div className="space-y-2">
              {subQueryArray.map((query, ind) => (
                <div 
                  key={ind} 
                  className="p-3 bg-[#1a1a1a] rounded-lg text-[#aaaaaa] border border-[#333333]"
                >
                  {query}
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Processing Status */}
          <div className="bg-[#212121] rounded-xl p-5">
            <h4 className="text-[18px] font-semibold text-[#f5f5f5] mb-4">
              Processing Status
            </h4>
            
            {!handlingStatus ? (
              <div className="flex items-center justify-center h-20">
                <div id="loader"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(subqueryNodeMap.entries()).map(([key, values]) => (
                  <div 
                    key={key} 
                    className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[#dddddd] font-medium">{key}</span>
                      <div className="flex items-center">
                        {subqueryStatusMap.get(key) === "done" && (
                          <BeenhereIcon className="text-green-500 ml-2" />
                        )}
                        {subqueryStatusMap.get(key) === "loading" && (
                          <div id="loader" className="scale-75"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {values.map((val, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#252525] rounded-full text-sm text-[#dddddd]"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 mt-4">
                  {isAllSubsProcessed === "done" && (
                    <div className="flex items-center rounded-full bg-[#332700] px-4 py-2 text-yellow-300">
                      <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-yellow-300"></div>
                      Merging Results...
                    </div>
                  )}
                  {isAllSubsProcessed === "generatedAnswer" && (
                    <div className="flex items-center rounded-full bg-[#003300] px-4 py-2 text-green-300">
                      <div className="mr-2 h-2 w-2 rounded-full bg-green-300"></div>
                      Processing Complete
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 700,
          style: {
            background: '#1a1a1a',
            color: '#f5f5f5',
            border: '1px solid #333333',
          },
        }}
      />
    </div>
  );
}


// "use client"

// import Image from "next/image"
// import { Toaster, toast } from "react-hot-toast"
// import generateSVG from "../public/img/svgs/generate.svg"
// import gradeDocsSVG from "../public/img/svgs/grade_docs.svg"
// import webSearchSVG from "../public/img/svgs/web_search.svg"
// import transformQuerySVG from "../public/img/svgs/transform_query.svg"
// import financeAgentSVG from "../public/img/svgs/finance_agent.svg"
// import reasoningAgentSVG from "../public/img/svgs/reasoning_agent.svg"
// import endSVG from "../public/img/svgs/end.svg"
// import sqlAgentSVG from "../public/img/svgs/sql_agent.svg"
// import retrieveSVG from "../public/img/svgs/retrieve.svg"
// import startSVG from "../public/img/svgs/start.svg"

// import BeenhereIcon from "@mui/icons-material/Beenhere"

// import { useRefreshContext } from "../context/VarContext"

// import "./Answer.css"

// import { io } from "socket.io-client"
// import { useEffect, useState } from "react"
// import MarkdownDisplay from "./MarkdownDisplay"
// const SOCKET_SERVER_URL = "http://localhost:7771" // Update to your backend's URL

// const i = 0

// export default function Answer({ answer }: { answer: string }) {
//   const [messages, setMessages] = useState([])
//   const [subQueryArray, setSubQueryArray] = useState([])
//   // const [subQueryEnd, setSubQueryEnd] = useState("");
//   const [answer2, setAnswer2] = useState("")
//   const [atNode, setAtNode] = useState("start")
//   const [processedSubQueryArray, setProcessedSubQueryArray] = useState([])
//   const [SubQueryQueue, setSubQueryQueue] = useState([])
//   const [currentSubQuery, setCurrentSubQuery] = useState("")

//   // const [time, setTime] = useState(0); // State to track the time
//   // const [isRunning, setIsRunning] = useState(false);

//   const { refreshVar, setrefreshVar } = useRefreshContext()

//   const [subqueryNodeMap, setSubqueryNodeMap] = useState<Map<string, string[]>>(new Map())

//   const [subqueryStatusMap, setSubqueryStatusMap] = useState<Map<string, string>>(new Map())

//   const [handlingStatus, setHandlingStatus] = useState(false)

//   const [isAllSubsProcessed, setIsAllSubsProcessed] = useState("nope")

//   // Function to add new values to an existing key or create a new key
//   const addValuesToKey = (key: string, newValues: string) => {
//     setSubqueryNodeMap((prevMap) => {
//       // Get the current values for the key (or an empty array if key doesn't exist)
//       const currentValues = prevMap.get(key) || []

//       // Merge the current values with new values
//       const updatedValues = [...currentValues, newValues]

//       // Create a new Map with the updated values for the key
//       return new Map(prevMap.set(key, updatedValues))
//     })
//   }

//   const subqueryStatusMapSet = (key: string, newval: string) => {
//     setSubqueryStatusMap((prevMap) => {
//       // Get the current values for the key (or an empty array if key doesn't exist)
//       const currentValues = prevMap.get(key) || []

//       // Create a new Map with the updated values for the key
//       return new Map(prevMap.set(key, newval))
//     })
//   }

//   useEffect(() => {
//     if (refreshVar == "ready") {
//       setSubqueryNodeMap(new Map())
//       setSubqueryStatusMap(new Map())
//       setAnswer2("")
//       setHandlingStatus(false)
//       setIsAllSubsProcessed("nope")
//       setSubQueryArray([])
//     }
//     if (refreshVar == "stoppedResponse") {
//       setSubqueryNodeMap(new Map())
//       setSubqueryStatusMap(new Map())
//       setAnswer2("")
//       setHandlingStatus(false)
//       setIsAllSubsProcessed("nope")
//       setSubQueryArray([])
//     }
//   }, [refreshVar])

//   useEffect(() => {
//     // let interval: NodeJS.Timeout | null = null;
//     // if (isRunning) {
//     //   interval = setInterval(() => {
//     //     setTime((prevTime) => prevTime + 1); // Increment time by 1 every second
//     //   }, 1000); // Update every 1000 ms (1 second)
//     // } else if (!isRunning && time !== 0) {
//     //   if (interval) clearInterval(interval); // Clear the interval when the stopwatch stops
//     // }

//     // Connect to the Socket.IO server
//     const socket = io(SOCKET_SERVER_URL)

//     // Listen for messages from the backend
//     socket.on("message_to_frontend_subquery_array", (data) => {
//       // setIsRunning(true);
//       data = JSON.parse(data)
//       setSubQueryArray(data)
//       // setMessages((prevMessages) => [...prevMessages, data]);
//     })

//     socket.on("message_to_frontend_subquery_start", (data) => {
//       const sub_query = JSON.parse(data)

//       subqueryStatusMapSet(sub_query, "loading")

//       setCurrentSubQuery(data)
//       // setMessages((prevMessages) => [...prevMessages, data]);
//       setSubQueryQueue((prevStack) => [...prevStack, data])
//     })

//     socket.on("message_to_frontend_subquery_end", (data) => {
//       data = JSON.parse(data)

//       const { sub_query } = data

//       subqueryStatusMapSet(sub_query, "done")

//       setSubQueryQueue((prevQueue) => {
//         if (prevQueue.length > 0) {
//           const [firstElement, ...restQueue] = prevQueue // Destructure to remove the first element

//           // Ensure the firstElement is not already in the ProcessedSubQueryArray
//           setProcessedSubQueryArray((prevArray) => {
//             if (!prevArray.includes(firstElement)) {
//               return [...prevArray, firstElement] // Add only if it's not already added
//             }
//             return prevArray
//           })

//           return restQueue // Return the queue without the first element
//         } else {
//           return prevQueue // Return the unchanged queue if it's empty
//         }
//       })

//       // setProcessedSubQueryArray((pq) =>[...pq, data]);
//     })

//     socket.on("message_to_frontend_atnode", (data) => {
//       setHandlingStatus(true)
//       data = JSON.parse(data)

//       console.log("xxxx", data)

//       const { sub_query, node } = data

//       setAtNode(node)
//       setMessages((prevMessages) => [...prevMessages, data])
//       addValuesToKey(sub_query, node)
//     })

//     socket.on("message_to_frontend_answer", (data) => {
//       setIsAllSubsProcessed("generatedAnswer")
//       // setIsRunning(false);
//       data = JSON.parse(data)
//       setrefreshVar("generated")
//       setAtNode("start")
//       setAnswer2(data)
//       setMessages((prevMessages) => [...prevMessages, data])
//     })

//     socket.on("message_to_frontend_all_subs_processed", (data) => {
//       setIsAllSubsProcessed("done")
//     })

//     // Clean up the socket connection when the component unmounts
//     return () => {
//       socket.disconnect()
//       // if (interval) clearInterval(interval); // Clean up the interval on component unmount
//     }
//   }, [])

//   const arr = [
//     startSVG,
//     webSearchSVG,
//     generateSVG,
//     transformQuerySVG,
//     retrieveSVG,
//     gradeDocsSVG,
//     financeAgentSVG,
//     reasoningAgentSVG,
//     endSVG,
//     sqlAgentSVG,
//   ]

//   const [myMap, setMyMap] = useState<{ [key: string]: any }>({
//     start: startSVG,
//     web_search: webSearchSVG,
//     generate: generateSVG,
//     transform_query: transformQuerySVG,
//     retrieve: retrieveSVG,
//     grade_documents: gradeDocsSVG,
//     finance_agent: financeAgentSVG,
//     reasoning_agent: reasoningAgentSVG,
//     end: endSVG,
//     sql_agent: sqlAgentSVG,
//   })

//   const [ctr, setCounter] = useState(0)

//   const markdown = `A paragraph with *emphasis* and **strong importance**.

// > A block quote with ~strikethrough~ and a URL: https://reactjs.org.

// * Lists
// * [ ] todo
// * [x] done

// A table:

// | a | b |
// | - | - |
// `

//   return (
//     <div className="mx-auto my-24 flex h-auto w-[90%] shrink-0 flex-col gap-4 rounded-3xl bg-[#121212] p-5 border border-[#333333] shadow-lg lg:p-10">
//       <div className="flex flex-col lg:flex-row justify-between gap-5">
//         <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-center">
//           <Image
//             src={myMap[atNode] || "/placeholder.svg"}
//             height={600}
//             alt="process visualization"
//             className="max-w-full h-auto"
//           />
//         </div>

//         <div className="flex flex-col flex-1">
//           <div className="h-[600px] w-full overflow-y-auto bg-[#1a1a1a] rounded-xl p-6 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-[#222]">
//             <p className="font-bold mb-4 mt-2 text-xl text-[#f5f5f5] border-b border-[#333] pb-2">
//               Sub Queries to be Handled
//             </p>

//             {subQueryArray.map((query, ind) => (
//               <p key={ind} className="text-[#bbbbbb] py-1 px-2 my-1 rounded hover:bg-[#252525] transition-colors">
//                 {query}
//               </p>
//             ))}

//             <p className="my-5 mb-4 text-xl font-bold text-[#f5f5f5] border-b border-[#333] pb-2">Handling</p>
//             {!handlingStatus ? (
//               <div id="loader" className="mx-auto my-8"></div>
//             ) : (
//               <>
//                 <div className="space-y-4">
//                   {Array.from(subqueryNodeMap.entries()).map(([key, values]) => (
//                     <div key={key} className="my-3 flex text-[#bbbbbb] bg-[#222] p-3 rounded-lg">
//                       <div className="flex flex-col flex-1">
//                         <div className="font-medium text-[#dddddd]">{key}</div>
//                         <div className="my-2 flex flex-wrap gap-2">
//                           {values.map((val, index) => (
//                             <div key={index} className="rounded-full bg-[#333] p-1 px-3 text-[#f0f0f0] text-sm">
//                               {val}
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       <div className="mx-2 p-1 flex items-start">
//                         {subqueryStatusMap.get(key) == "done" ? <BeenhereIcon className="text-green-400" /> : null}

//                         {subqueryStatusMap.get(key) == "loading" ? <div id="loader" className="scale-75"></div> : null}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-8 flex">
//                   {isAllSubsProcessed == "done" && (
//                     <div className="flex w-auto rounded-full bg-[#332700] p-2 px-4 text-yellow-300 items-center">
//                       <div className="w-2 h-2 bg-yellow-300 rounded-full mr-2 animate-pulse"></div>
//                       Merging Answers
//                     </div>
//                   )}

//                   {isAllSubsProcessed == "generatedAnswer" && (
//                     <div className="flex w-auto rounded-full bg-[#003300] p-2 px-4 text-green-300 items-center">
//                       <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
//                       Merged
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="m-auto mt-8 w-full rounded-xl bg-[#1a1a1a] p-6 border border-[#333]">
//         <div className="mb-6 flex items-center justify-between pb-3 border-b border-[#333]">
//           <div className="flex gap-4 items-center">
//             <Image unoptimized src="/img/Info.svg" alt="info" width={24} height={24} className="block lg:hidden" />
//             <h3 className="text-[20px] font-bold uppercase text-[#f5f5f5]">Answer</h3>
//           </div>
//           {answer2 && (
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => {
//                   navigator.clipboard.writeText(answer2.trim())
//                   toast("Answer copied to clipboard", {
//                     icon: "✂️",
//                     style: { backgroundColor: "#222", color: "white", border: "1px solid #444" },
//                   })
//                 }}
//                 className="p-2 rounded-full hover:bg-[#333] transition-colors"
//               >
//                 <Image unoptimized src="/img/copy.svg" alt="copy" width={20} height={20} className="cursor-pointer" />
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="flex flex-wrap content-center items-center gap-[15px]">
//           <div className="w-full whitespace-pre-wrap text-base font-light leading-[152.5%] text-[#dddddd]">
//             {answer2 ? (
//               <div className="prose prose-invert max-w-none">
//                 <MarkdownDisplay content={answer2} />
//               </div>
//             ) : (
//               <div className="flex w-full flex-col gap-3">
//                 <div className="h-6 w-full animate-pulse rounded-md bg-[#2a2a2a]" />
//                 <div className="h-6 w-3/4 animate-pulse rounded-md bg-[#2a2a2a]" />
//                 <div className="h-6 w-5/6 animate-pulse rounded-md bg-[#2a2a2a]" />
//                 <div className="h-6 w-full animate-pulse rounded-md bg-[#2a2a2a]" />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <Toaster
//         position="top-right"
//         reverseOrder={false}
//         toastOptions={{
//           duration: 700,
//           style: {
//             background: "#222",
//             color: "#fff",
//             border: "1px solid #444",
//           },
//         }}
//       />
//     </div>
//   )
// }

