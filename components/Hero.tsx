// "use client"

// import type React from "react"

// import type { FC } from "react"
// import InputArea from "./InputArea"

// type THeroProps = {
//   promptValue: string
//   setPromptValue: React.Dispatch<React.SetStateAction<string>>
//   handleDisplayResult: () => void
// }

// const Hero: FC<THeroProps> = ({ promptValue, setPromptValue, handleDisplayResult }) => {
//   const handleClickSuggestion = (value: string) => {
//     setPromptValue(value)
//   }

//   return (
//     <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#121212]">
//       {/* Main content wrapper with dark gradient background */}
//       <div className="w-full max-w-[708px] rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#151515] p-6 shadow-lg border border-[#2a2a2a]/30">
//         <h2 className="text-2xl font-semibold text-white mb-4 text-center">Ask anything</h2>

//         {/* Input area */}
//         <InputArea
//           promptValue={promptValue}
//           setPromptValue={setPromptValue}
//           handleDisplayResult={handleDisplayResult}
//         />
//       </div>

//       {/* Suggestions section with dark styling */}
//       <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-[708px]">
//         {suggestions.map((item) => (
//           <button
//             key={item.id}
//             className="flex items-center justify-center gap-2 rounded-full border border-[#333333] bg-[#212121] px-4 py-2.5 transition-all hover:border-[#515151] hover:bg-[#292929] active:scale-95"
//             onClick={() => handleClickSuggestion(item?.name)}
//           >
//             {item.icon && (
//               <span className="relative w-4 h-4">
//                 <img src={item.icon || "/placeholder.svg"} alt="" className="w-full h-full object-contain" />
//               </span>
//             )}
//             <span className="text-sm font-medium text-gray-300">{item.name}</span>
//           </button>
//         ))}
//       </div>

//       {/* GitHub link section with dark styling */}
//       <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400">
//         <span>Github Code!</span>
//         <a
//           href="add your github link here"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="font-medium text-[#6d9eff] underline-offset-4 hover:underline transition-colors"
//         >
//           Star it on GitHub
//         </a>
//       </div>
//     </div>
//   )
// }

// type suggestionType = {
//   id: number
//   name: string
//   icon: string
// }

// const suggestions: suggestionType[] = [
//   {
//     id: 1,
//     name: "What are the company's revenue sources?",
//     icon: "/img/icon_leaf.svg",
//   },
//   {
//     id: 2,
//     name: "Latest financial news?",
//     icon: "/img/icon_dumbell.svg",
//   },
//   {
//     id: 3,
//     name: "Details on Apple stocks?",
//     icon: "/img/icon_atom.svg",
//   },
// ]

// export default Hero

"use client"

import type React from "react"
import type { FC } from "react"
import InputArea from "./InputArea"

type THeroProps = {
  promptValue: string
  setPromptValue: React.Dispatch<React.SetStateAction<string>>
  handleDisplayResult: () => void
}

const Hero: FC<THeroProps> = ({ promptValue, setPromptValue, handleDisplayResult }) => {
  const handleClickSuggestion = (value: string) => {
    setPromptValue(value)
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#121212]">
      {/* Hero Image Section */}
      <div className="w-full max-w-[708px] mb-8 relative">
        <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl  h-[200px]">
          <img 
            src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=2000&h=800"
            alt="Financial Technology"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212] opacity-90"></div>
        </div>
      </div>

      {/* Main content wrapper with dark gradient background */}
      <div className="w-full max-w-[708px] rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#151515] p-6 shadow-lg border border-[#2a2a2a]/30">
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">Ask anything</h2>

        {/* Input area */}
        <InputArea
          promptValue={promptValue}
          setPromptValue={setPromptValue}
          handleDisplayResult={handleDisplayResult}
        />
      </div>

      {/* Suggestions section with dark styling */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-[708px]">
        {suggestions.map((item) => (
          <button
            key={item.id}
            className="flex items-center justify-center gap-2 rounded-full border border-[#333333] bg-[#212121] px-4 py-2.5 transition-all hover:border-[#515151] hover:bg-[#292929] active:scale-95"
            onClick={() => handleClickSuggestion(item?.name)}
          >
            {item.icon && (
              <span className="relative w-4 h-4">
                <img src={item.icon || "/placeholder.svg"} alt="" className="w-full h-full object-contain" />
              </span>
            )}
            <span className="text-sm font-medium text-gray-300">{item.name}</span>
          </button>
        ))}
      </div>

      {/* GitHub link section with dark styling */}
      <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400">
        <span>Github Code!</span>
        <a
          href="add your github link here"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#6d9eff] underline-offset-4 hover:underline transition-colors"
        >
          Star it on GitHub
        </a>
      </div>
    </div>
  )
}

type suggestionType = {
  id: number
  name: string
  icon: string
}

const suggestions: suggestionType[] = [
  {
    id: 1,
    name: "What are the company's revenue sources?",
    icon: "/img/icon_leaf.svg",
  },
  {
    id: 2,
    name: "Latest financial news?",
    icon: "/img/icon_dumbell.svg",
  },
  {
    id: 3,
    name: "Details on Apple stocks?",
    icon: "/img/icon_atom.svg",
  },
]

export default Hero