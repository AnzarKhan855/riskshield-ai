"use client";

import React, { useState } from "react";
import { CommentRecord } from "@/types/investigation";
import { MessageSquare, Send } from "lucide-react";
import { useAddComment } from "@/hooks/useCases";

interface AnalystNotesProps {
  caseId: string;
  commentsList: CommentRecord[];
}

export default function AnalystNotes({ caseId, commentsList }: AnalystNotesProps) {
  const [noteText, setNoteText] = useState("");
  const addCommentMutation = useAddComment();

  const handlePostNote = () => {
    if (noteText.trim()) {
      addCommentMutation.mutate(
        { id: caseId, values: { comment: noteText } },
        {
          onSuccess: () => setNoteText(""),
        }
      );
    }
  };

  return (
    <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-graphite-800 pb-3">
        <MessageSquare className="w-5 h-5 text-copper-400" />
        <h3 className="text-sm font-semibold text-white">
          Analyst Investigation Notes ({commentsList?.length || 0})
        </h3>
      </div>

      {/* Note Authoring Input */}
      <div className="space-y-2">
        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write analyst investigation findings, evidence notes, or phone verification logs..."
          className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handlePostNote}
            disabled={addCommentMutation.isPending || !noteText.trim()}
            className="px-4 py-2 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 fill-graphite-950" />
            <span>{addCommentMutation.isPending ? "Posting Note..." : "Add Note"}</span>
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-3 pt-2">
        {commentsList?.map((c) => (
          <div key={c.id} className="bg-graphite-950 border border-graphite-800 rounded-lg p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white font-mono">{c.author_name}</span>
              <span className="text-graphite-400 font-mono text-[10px]">
                {new Date(c.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-graphite-200 font-mono leading-relaxed">{c.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
