import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { Info } from "lucide-react";

const faqItems = [
  {
    question: "What is Telescope?",
    answer: "A tool for Avalanche users to discover stars onchain.",
  },
  {
    question: "What do I do?",
    answer: "Currently, you can interact once a day for 1 XP by posting on the forum.",
  },
  {
    question: "What is XP for?",
    answer:
      "XP gives you points to spend on WLs & airdrops provided by Avalanche projects.",
  },
  {
    question: "How can I redeem points?",
    answer:
      "Connect your wallet, click 'Collect rewards' and open the #collect channel on our Discord.",
  },
  {
    question: "Can I use multiple wallets to vote?",
    answer:
      "Yes, but only one wallet can connect with your Discord account to redeem rewards.",
  },
  {
    question: "How long is voting?",
    answer: "Voting epochs last for 1 month, then results become immortalised.",
  },
];

export const FAQ = () => {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <button className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-lg p-2 shadow hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
          <Info size={20} />
        </button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle className="text-xl">FAQ</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="rounded-md flex flex-col gap-4">
          {faqItems.map((item, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-sky-900 dark:text-sky-400">
                {item.question}
              </h3>
              <p className="text-zinc-900 dark:text-zinc-100">{item.answer}</p>
            </div>
          ))}
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
};
