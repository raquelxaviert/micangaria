'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, User, MapPin, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { useCheckout } from './CheckoutContext';

interface CheckoutProgressProps {
  currentStep: number;
  formProgress?: number; // 0-100
}

export function CheckoutProgress({ currentStep, formProgress = 0 }: CheckoutProgressProps) {
  const steps = [
    { id: 1, icon: Truck},
    { id: 2, icon: CreditCard},
  ];

  // Progresso baseado apenas no preenchimento do formulário (0-100%)
  const progressPercentage = Math.min(formProgress, 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-gray-100/95 to-gray-50/95 backdrop-blur-sm border-t border-gray-200/50 py-4 shadow-lg">
      <div className="w-full px-6">
        <div className="relative h-16">
          {/* Progress bar - atravessa toda a largura entre os ícones */}
          <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Steps - ícones posicionados absolutamente nas extremidades */}
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = step.id <= currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div 
                key={step.id} 
                className={`absolute flex flex-col items-center ${
                  index === 0 ? 'left-0' : 'right-0'
                }`}
                style={{ top: '0px' }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-white/90 backdrop-blur-sm border-2 shadow-sm ${
                    isActive && step.id !== 2 // Não colorir o ícone de pagamento
                      ? 'border-primary text-primary'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs font-medium ${
                      isActive && step.id !== 2 ? 'text-primary' : 'text-gray-400'
                    }`}
                  >
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
