export default function Answer({ answer }: { answer: string }) {
  console.log("Answer component received:", {
    answer,
    type: typeof answer,
    length: answer?.length
  });
  
  return (
    <div className="container mx-auto px-5 lg:px-10">
      <div className="flex w-full items-start gap-4">
        <div className="w-full whitespace-pre-wrap text-[#aaaaaa]">
          {answer || "No answer available"}
        </div>
      </div>
    </div>
  );
} 