'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, User, MapPin, Truck, CreditCard } from 'lucide-react';
import { useCheckout } from './CheckoutContext';

export function CheckoutProgress() {
  const { currentStep } = useCheckout();

  const steps = [
    { id: 'customer', label: 'Dados', icon: User },
    { id: 'address', label: 'Endereço', icon: MapPin },
    { id: 'shipping', label: 'Frete', icon: Truck },
    { id: 'payment', label: 'Pagamento', icon: CreditCard },
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : status === 'current'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-500'
                    }
                  `}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`
                    text-xs mt-1 font-medium
                    ${status === 'current' ? 'text-primary' : 'text-gray-500'}
                  `}>
                    {step.label}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 h-px mx-2
                    ${getStepStatus(steps[index + 1].id) === 'completed' || status === 'completed'
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                    }
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
