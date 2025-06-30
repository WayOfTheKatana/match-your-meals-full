import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

const FaqSection = React.forwardRef(
  ({ className, title, description, items, contactInfo, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "w-full bg-gradient-to-b from-transparent via-gray-100/50 to-transparent sm:py-16 py-8 px-4 sm:px-6",
          className
        )}
        {...props}
      >
        <div className="max-w-4xl w-full mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full mx-auto text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl font-semibold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gray-600 font-urbanist">{description}</p>
            )}
          </motion.div>

          {/* FAQ Items */}
          <div className="w-full sm:max-w-2xl mx-auto space-y-2">
            {items.map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
                index={index}
              />
            ))}
          </div>

          {/* Contact Section */}
          {contactInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-md mx-auto mt-12 p-6 rounded-lg text-center"
            >
              <div className="inline-flex items-center justify-center p-1.5 rounded-full mb-4">
                <Mail className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {contactInfo.title}
              </p>
              <p className="text-xs text-gray-600 mb-4">
                {contactInfo.description}
              </p>
              <Button size="sm" onClick={contactInfo.onContact}>
                {contactInfo.buttonText}
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    );
  }
);
FaqSection.displayName = "FaqSection";

// Internal FaqItem component
const FaqItem = React.forwardRef(
  (props, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { question, answer, index } = props;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.1 }}
        className={cn(
          "group rounded-lg w-full",
          "transition-all duration-200 ease-in-out",
          "border border-gray-200/50",
          isOpen
            ? "bg-gradient-to-br from-white via-gray-100/50 to-white"
            : "hover:bg-[#d85809]/10"
        )}
      >
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 sm:px-6 py-4 h-auto justify-between hover:bg-transparent"
        >
          <h3
            className={cn(
              "text-[10px] sm:text-xs font-medium transition-colors duration-200 text-left",
              "text-gray-700",
              isOpen && "text-gray-900"
            )}
          >
            {question}
          </h3>
          <motion.div
            animate={{
              rotate: isOpen ? 180 : 0,
              scale: isOpen ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "p-0.5 rounded-full flex-shrink-0",
              "transition-colors duration-200",
              isOpen ? "text-primary-600" : "text-gray-500"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: { duration: 0.2, ease: "easeIn" },
              }}
            >
              <div className="px-3 sm:px-6 pb-4 pt-2">
                <motion.p
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="text-[10px] sm:text-xs text-gray-600 leading-relaxed break-all whitespace-normal"
                >
                  {answer}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);
FaqItem.displayName = "FaqItem";

export { FaqSection };