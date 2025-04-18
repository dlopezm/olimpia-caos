import {
  FaShareNodes,
  FaClipboardCheck,
  FaRegClipboard,
} from "react-icons/fa6";
import "./MatchPlanner.css";
import { useState } from "react";

interface ShareButtonProps {
  text: string;
}

export const ShareButton = (props: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const canShare = !!navigator.share;
  return (
    <div className="button-wrapper">
      <button
        onClick={() => {
          if (canShare) {
            navigator.share({
              title: "Partit!",
              text: props.text,
              url: window.location.href,
            });
          } else {
            navigator.clipboard.writeText(
              props.text + "\n" + window.location.href,
            );
            setCopied(true);
          }
        }}
        className="button"
      >
        {canShare ? (
          <>
            <FaShareNodes /> Comparteix
          </>
        ) : copied ? (
          <>
            <FaClipboardCheck /> Copiat!
          </>
        ) : (
          <>
            <FaRegClipboard /> Copia
          </>
        )}
      </button>
    </div>
  );
};
