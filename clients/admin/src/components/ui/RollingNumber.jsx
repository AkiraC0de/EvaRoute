import { motion, useReducedMotion } from "motion/react";

/**
 * Casino-reel rolling digits for stat values: every digit column is a reel
 * that spins forward through the decimals (two wheels) and lands on its
 * target, staggered left to right — the number "arrives" instead of popping.
 *
 * Non-digit characters (commas, %, +, spaces) ride along statically, and
 * strings without digits (loading "—" placeholders) render as-is with no
 * animation. Values re-roll when they change (e.g. after a refetch).
 *
 * Accessibility: the reels are decorative — the container carries the plain
 * final value for assistive tech. Reduced motion shows the value instantly.
 *
 * Layout: one `ch` wide, `1em` tall digit boxes, so the row scales with the
 * caller's font size and never shifts width while spinning.
 */
const START_DIGIT = 1;
const SPIN_STEPS = 20;

const buildReel = (targetDigit) => {
  const reel = [String(START_DIGIT)];
  for (let i = 1; i <= SPIN_STEPS; i += 1) {
    reel.push(String((START_DIGIT + i) % 10));
  }
  reel.push(String(targetDigit));
  return reel;
};

const RollingNumber = ({ value, className = "" }) => {
  const reduceMotion = useReducedMotion();
  const text = String(value ?? "");

  if (reduceMotion || !/\d/.test(text)) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.split("").map((char, i) => {
          if (!/\d/.test(char)) {
            return (
              <span key={`s${i}`} className="inline-block">
                {char}
              </span>
            );
          }
          const reel = buildReel(char);
          const landing = reel.length - 1;
          // Column index derived, never mutated (react-hooks/immutability):
          // digits to the left of this character.
          const columnIndex = text.slice(0, i).replace(/\D/g, "").length;
          const delay = columnIndex * 0.08;
          return (
            <span
              key={`d${i}`}
              className="relative inline-block overflow-hidden align-bottom"
              style={{ height: "1em", width: "1ch" }}
            >
              <motion.span
                className="block will-change-transform"
                initial={{ y: "0em" }}
                animate={{ y: `-${landing}em` }}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                  delay,
                }}
              >
                {reel.map((digit, n) => (
                  <span
                    key={n}
                    className="block text-center"
                    style={{ height: "1em", lineHeight: "1em" }}
                  >
                    {digit}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
};

export default RollingNumber;
