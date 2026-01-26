import Card from '@/components/ui/Card';

/*
  FAQ Page

  Frequently asked questions and best practices for review collection.
  This is a Server Component (no client-side interactivity needed).

  SECTIONS:
  1. How it works
  2. Best practices
  3. Do's and Don'ts
  4. How often to ask for reviews
*/

export const metadata = {
  title: 'FAQ & Best Practices',
  description: 'Learn how to effectively collect and manage customer reviews',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'How does Review Bot work?',
      answer:
        'Review Bot helps your customers write reviews by providing pre-written phrases they can select. They choose phrases that describe their experience, and the tool combines them into a natural-sounding review. Then they copy the review and click through to Google to paste it.',
    },
    {
      question: 'Is this fake review generation?',
      answer:
        'No! The customer still writes their own review - they just get help structuring it. They select phrases that genuinely describe their experience. This makes it easier for customers who want to leave a review but struggle with writing. The review is always in their own voice and reflects their real experience.',
    },
    {
      question: 'How do I get my Google review link?',
      answer:
        'Go to your Google Business Profile, click "Get more reviews" or search for "Google review link generator". You\'ll get a direct link that takes customers straight to the review form. Paste this link when setting up your company in Review Bot.',
    },
    {
      question: 'Can customers customize the generated review?',
      answer:
        'Yes! The generated text is just a starting point. Customers can (and should) edit it before posting to add personal details or adjust the wording. This makes each review unique and authentic.',
    },
    {
      question: 'How do email reminders work?',
      answer:
        'Customers can sign up via QR code or link to receive review reminders. Currently, you export the email list and send reminders manually through your preferred email tool. Automatic reminders are planned for a future update.',
    },
  ];

  const bestPractices = [
    {
      title: 'Ask at the right moment',
      description:
        'Request reviews when customers are happiest - right after a successful service, positive interaction, or when they express satisfaction. Timing is everything.',
    },
    {
      title: 'Make it easy',
      description:
        'Use QR codes at checkout, include links in receipts, and send follow-up emails. The fewer steps, the more reviews you\'ll get.',
    },
    {
      title: 'Respond to every review',
      description:
        'Thank positive reviewers and address negative feedback professionally. This shows you care and encourages others to leave reviews.',
    },
    {
      title: 'Be consistent',
      description:
        'Don\'t just ask once. Make review requests part of your regular process. Steady growth beats sporadic bursts.',
    },
    {
      title: 'Train your team',
      description:
        'Everyone should know how to ask for reviews naturally. "If you enjoyed your visit, we\'d love a review!" works better than scripted requests.',
    },
  ];

  const dos = [
    'Ask satisfied customers directly',
    'Use QR codes in visible locations',
    'Follow up via email 1-2 days after service',
    'Thank customers who leave reviews',
    'Respond professionally to negative reviews',
    'Make the review process as simple as possible',
    'Space out your review requests naturally',
  ];

  const donts = [
    'Never offer incentives for reviews (violates Google policy)',
    'Don\'t ask everyone - focus on satisfied customers',
    'Don\'t send too many reminder emails',
    'Don\'t argue with negative reviewers publicly',
    'Don\'t fake reviews or use review farms',
    'Don\'t ignore negative feedback',
    'Don\'t review your own business',
  ];

  const frequency = [
    {
      scenario: 'Service-based business (dental, salon, etc.)',
      recommendation: 'Ask after each appointment, follow up once if no review after 3 days',
    },
    {
      scenario: 'Retail store',
      recommendation: 'QR code on receipts, ask verbally for exceptional experiences',
    },
    {
      scenario: 'Restaurant',
      recommendation: 'QR code on table tents or receipts, ask during positive interactions',
    },
    {
      scenario: 'Email list subscribers',
      recommendation: 'Send reminders monthly, not more than once per month per person',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          FAQ & Best Practices
        </h1>
        <p className="text-lg text-gray-600">
          Everything you need to know about collecting reviews effectively and ethically
        </p>
      </div>

      {/* FAQs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12" id="best-practices">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Best Practices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestPractices.map((practice, index) => (
            <Card key={index}>
              <h3 className="font-semibold text-gray-900 mb-2">{practice.title}</h3>
              <p className="text-gray-600 text-sm">{practice.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Do's and Don'ts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Do&apos;s and Don&apos;ts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Do
            </h3>
            <ul className="space-y-2">
              {dos.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                  <span className="text-green-500 mt-1">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Don&apos;t
            </h3>
            <ul className="space-y-2">
              {donts.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-red-800">
                  <span className="text-red-500 mt-1">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* How Often to Ask */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          How Often Should You Ask?
        </h2>
        <Card>
          <div className="space-y-4">
            {frequency.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <p className="font-medium text-gray-900">{item.scenario}</p>
                <p className="text-gray-600 text-sm mt-1">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* SEO Benefits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Why Reviews Matter for SEO
        </h2>
        <Card className="bg-primary-50 border-primary-200">
          <div className="space-y-4">
            <p className="text-gray-700">
              Google reviews directly impact your local search ranking. Here&apos;s why:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">1.</span>
                <span><strong>Review quantity</strong> signals business legitimacy and popularity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">2.</span>
                <span><strong>Review quality</strong> (star rating) affects click-through rates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">3.</span>
                <span><strong>Review recency</strong> shows active, current business operation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">4.</span>
                <span><strong>Review responses</strong> demonstrate customer engagement</span>
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              Businesses with 50+ reviews typically see 25-50% more visibility in local search results
              compared to those with fewer than 10 reviews.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
