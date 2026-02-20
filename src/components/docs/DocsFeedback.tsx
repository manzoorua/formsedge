import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DocsFeedback = () => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const { toast } = useToast();

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    toast({
      title: "Thank you for your feedback!",
      description: "Your input helps us improve our documentation.",
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Was this page helpful?</h3>
        <div className="flex space-x-3">
          <Button
            variant={feedback === 'positive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedback('positive')}
            disabled={feedback !== null}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Yes
          </Button>
          <Button
            variant={feedback === 'negative' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedback('negative')}
            disabled={feedback !== null}
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            No
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocsFeedback;
