import { auth } from "@clerk/nextjs/server";
import PdfChatClient from "@/components/PdfChatClient";

const PdfChatPage = async () => {
  const { userId } = await auth();

  // Only logged-in users can access this page
  if (!userId) {
    return (
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-4">PDF Chat</h1>
        <p className="text-muted-foreground">
          Please sign in to upload a PDF and chat with it.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-4">PDF Chat</h1>
      <p className="text-muted-foreground mb-6">
        Attach a PDF document and ask questions about it. Your answers will be
        generated using Gemini and grounded in your PDF content.
      </p>
      <PdfChatClient />
    </main>
  );
};

export default PdfChatPage;

