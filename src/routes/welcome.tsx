import { useContext } from "react";
import { motion } from "framer-motion";
import { FlowDirectionContext, shellVariants } from "../components/QuestionShell";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

const SKYLINE = [
  { height: 40, delay: 0.15 },
  { height: 72, delay: 0.25 },
  { height: 56, delay: 0.35 },
  { height: 92, delay: 0.45 },
  { height: 64, delay: 0.55 },
  { height: 84, delay: 0.65 },
  { height: 48, delay: 0.75 },
];

export function Welcome() {
  const direction = useContext(FlowDirectionContext);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();

  return (
    <motion.section
      custom={direction}
      variants={shellVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="relative mx-auto flex w-full max-w-xl flex-col items-center px-6 pb-24 pt-6 text-center sm:pt-12"
    >
      {/* Before: -left-/-right- kept these ambient blobs on a fixed physical
          side in both languages. After: logical -start-/-end- mirror them
          under RTL, matching the me-[0.28em] treatment already used on the
          title words below. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -start-28 -top-12 h-64 w-64 rounded-pill bg-accentSoft/45 blur-3xl"
        animate={{ x: [0, 26, 0], y: [0, 16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 top-40 h-72 w-72 rounded-pill bg-accent/15 blur-3xl"
        animate={{ x: [0, -22, 0], y: [0, -14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="mb-10 flex items-end gap-2"
        aria-hidden="true"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        {SKYLINE.map((bar) => (
          <motion.div
            key={bar.delay}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: bar.delay, type: "spring", stiffness: 180, damping: 16 }}
            className="w-8 origin-bottom rounded-t-lg bg-accentSoft"
            style={{ height: bar.height }}
          >
            <motion.div
              className="h-full w-full rounded-t-lg bg-accent/25"
              animate={{ opacity: [0.2, 0.55, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: bar.delay }}
            />
          </motion.div>
        ))}
      </motion.div>

      <h1 className="text-[32px] font-bold leading-[1.2] tracking-tight text-ink sm:text-[40px]">
        {s.welcome.titleWords.map((word, i) => (
          <motion.span
            key={`${word}${i}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="me-[0.28em] inline-block"
          >
            {word}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 max-w-md text-[16px] leading-relaxed text-inkMuted"
      >
        {s.welcome.sub}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10"
      >
        <motion.button
          type="button"
          onClick={goNext}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          animate={{
            boxShadow: [
              "0 6px 22px rgba(91, 155, 213, 0.30)",
              "0 10px 34px rgba(91, 155, 213, 0.55)",
              "0 6px 22px rgba(91, 155, 213, 0.30)",
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-pill bg-accent px-12 py-4 text-[18px] font-semibold text-white hover:bg-accentDeep"
        >
          {s.welcome.start}
        </motion.button>
        <p className="mt-4 text-[13px] text-inkMuted">{s.welcome.caption}</p>
      </motion.div>
    </motion.section>
  );
}
