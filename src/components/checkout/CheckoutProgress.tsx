'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, User, MapPin, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { useCheckout } from './CheckoutContext';

interface CheckoutProgressProps {
  currentStep: number;
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps = [
    { id: 1, label: 'Entrega' },
    { id: 2, label: 'Pagamento' },
    { id: 3, label: 'Confirmação' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress bar */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                step.id <= currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {step.id < currentStep ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                step.id <= currentStep ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
