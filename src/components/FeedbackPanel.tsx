'use client';

import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const emojiRatings = [
  { emoji: '😢', label: 'Very Bad', value: 1 },
  { emoji: '😕', label: 'Bad', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😊', label: 'Good', value: 4 },
  { emoji: '😍', label: 'Excellent', value: 5 }
];

export default function FeedbackPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const handleSendToWhatsApp = () => {
    if (!feedback.trim() && rating === null) {
      alert('Please add a rating or feedback');
      return;
    }

    const ratingText = rating ? emojiRatings.find(r => r.value === rating)?.emoji : '';
    const message = `*Feedback from Website*\n\n*Rating:* ${ratingText} ${rating ? emojiRatings.find(r => r.value === rating)?.label : 'No rating'}\n\n*Message:* ${feedback || 'No additional comments'}`;
    const whatsappUrl = `https://wa.me/919345259073?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setFeedback('');
    setRating(null);
    setIsOpen(false);
  };

  return (
    <>
      <div
        className={`fixed left-0 bottom-16 sm:bottom-20 md:bottom-24 z-40 transition-all duration-300 pointer-events-auto ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-b from-emerald-400 to-emerald-500 text-white px-2 sm:px-2.5 py-4 sm:py-5 rounded-r-lg shadow-lg hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 flex items-center gap-1 sm:gap-1.5 active:scale-95"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
          aria-label="Open feedback panel"
        >
          <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 -rotate-90" />
          <span className="font-semibold text-xs tracking-wider">FEEDBACK</span>
        </button>
      </div>

      <div
        className={`fixed bottom-16 sm:bottom-20 md:bottom-24 left-1 sm:left-2 md:left-4 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        <div className="flex flex-col max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 p-3 sm:p-4 flex items-center justify-between text-white rounded-t-2xl sticky top-0 z-10">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              <h2 className="text-base sm:text-lg font-bold">Feedback</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 rounded-full transition-colors active:scale-90"
              aria-label="Close feedback panel"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <p className="text-gray-600 text-xs sm:text-sm">
              Share your thoughts with us!
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                How was your experience?
              </label>
              <div className="flex justify-between gap-1.5 sm:gap-2">
                {emojiRatings.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setRating(item.value)}
                    className={`flex-1 flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg transition-all transform hover:scale-110 ${
                      rating === item.value
                        ? 'bg-emerald-50 border-2 border-emerald-400 scale-110'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                    title={item.label}
                  >
                    <span className="text-lg sm:text-2xl">{item.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Additional Comments (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more..."
                rows={3}
                className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
              />
            </div>

            <button
              onClick={handleSendToWhatsApp}
              className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-white py-2 sm:py-2.5 rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg text-xs sm:text-sm active:scale-95"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Send Feedback
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close feedback"
        ></div>
      )}
    </>
  );
}
