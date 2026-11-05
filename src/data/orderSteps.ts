export type StepIcon = 'bag' | 'chat' | 'check';

export interface OrderStep {
  icon: StepIcon;
  title: string;
  text: string;
}

export const orderSteps: OrderStep[] = [
  {
    icon: 'bag',
    title: 'Browse the collection',
    text: 'Look through our shoes and bags and pick the pieces you like.',
  },
  {
    icon: 'chat',
    title: 'Message us on WhatsApp',
    text: 'Tap "Enquire" on any product. Ask about sizes, colours or anything else.',
  },
  {
    icon: 'check',
    title: 'Confirm and receive',
    text: 'We agree on payment and delivery with you, then get your order ready.',
  },
];