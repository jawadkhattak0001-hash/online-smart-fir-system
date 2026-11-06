// src/components/ui/Stepper.js - COMPATIBLE WITH NATIVEWIND v2
import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

export function Stepper({ steps, currentStep, showLabels = true }) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between mb-8 relative">
        {/* Timeline line */}
        <View className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <View key={index} className="items-center flex-1 z-10">
              {/* Step Circle */}
              <View
                className={`
                  w-8 h-8 rounded-full items-center justify-center mb-2
                  ${isCompleted ? 'bg-green-500' : 
                    isCurrent ? 'bg-blue-600' : 
                    'bg-gray-200'}
                `}
                style={
                  isCurrent ? {
                    shadowColor: '#93c5fd',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 4,
                  } : {}
                }
              >
                {isCompleted ? (
                  <Check size={16} color="white" />
                ) : (
                  <Text className={`
                    font-semibold 
                    ${isCurrent ? 'text-white' : 
                      isUpcoming ? 'text-gray-500' : 'text-gray-700'}
                  `}>
                    {index + 1}
                  </Text>
                )}
              </View>

              {/* Step Label */}
              {showLabels && (
                <Text
                  className={`
                    text-xs text-center px-1
                    ${isCompleted ? 'text-green-600 font-semibold' : 
                      isCurrent ? 'text-blue-600 font-semibold' : 
                      'text-gray-500'}
                  `}
                  numberOfLines={2}
                >
                  {typeof step === 'object' ? step.label : step}
                </Text>
              )}

              {/* Step Description (if step is object) */}
              {showLabels && typeof step === 'object' && step.description && (
                <Text 
                  className="text-gray-500 text-xs text-center mt-1 px-1"
                  numberOfLines={2}
                >
                  {step.description}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Alternative: Simple Stepper without transitions
export function SimpleStepper({ steps, currentStep, showLabels = true }) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between mb-4 relative">
        {/* Timeline line */}
        <View className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <View key={index} className="items-center flex-1 z-10">
              <View
                className={`
                  w-8 h-8 rounded-full items-center justify-center mb-2 border-2
                  ${isCompleted ? 'bg-green-500 border-green-500' : 
                    isCurrent ? 'bg-blue-600 border-blue-600' : 
                    'bg-white border-gray-300'}
                `}
              >
                {isCompleted ? (
                  <Check size={16} color="white" />
                ) : (
                  <Text className={`
                    font-semibold 
                    ${isCompleted ? 'text-white' : 
                      isCurrent ? 'text-white' : 'text-gray-500'}
                  `}>
                    {index + 1}
                  </Text>
                )}
              </View>

              {showLabels && (
                <Text
                  className={`
                    text-xs text-center px-1
                    ${isCompleted ? 'text-green-600 font-semibold' : 
                      isCurrent ? 'text-blue-600 font-semibold' : 
                      'text-gray-500'}
                  `}
                  numberOfLines={2}
                >
                  {typeof step === 'object' ? step.label : step}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Vertical Stepper
export function VerticalStepper({ steps, currentStep }) {
  return (
    <View className="pl-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <View key={index} className="flex-row">
            {/* Timeline line and circle */}
            <View className="items-center mr-4">
              <View
                className={`
                  w-6 h-6 rounded-full items-center justify-center
                  ${isCompleted ? 'bg-green-500' : 
                    isCurrent ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                {isCompleted ? (
                  <Check size={12} color="white" />
                ) : (
                  <Text className={`
                    text-xs font-semibold
                    ${isCurrent ? 'text-white' : 'text-gray-700'}
                  `}>
                    {index + 1}
                  </Text>
                )}
              </View>
              
              {/* Vertical line */}
              {!isLast && (
                <View 
                  className={`w-0.5 h-12 mt-1 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} 
                />
              )}
            </View>

            {/* Content */}
            <View className="flex-1 pb-6">
              <Text className={`
                font-semibold mb-1
                ${isCompleted ? 'text-green-600' : 
                  isCurrent ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {typeof step === 'object' ? step.label : step}
              </Text>
              
              {typeof step === 'object' && step.description && (
                <Text className="text-gray-600 text-sm">
                  {step.description}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Stepper with progress percentage
export function ProgressStepper({ steps, currentStep }) {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <View className="mb-6">
      {/* Progress bar */}
      <View className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <View 
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
      
      {/* Steps */}
      <View className="flex-row justify-between">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStep;
          
          return (
            <View key={index} className="items-center">
              <View
                className={`
                  w-6 h-6 rounded-full items-center justify-center mb-2
                  ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                {isCompleted && index !== currentStep ? (
                  <Check size={12} color="white" />
                ) : (
                  <Text className={`
                    text-xs font-semibold
                    ${isCompleted ? 'text-white' : 'text-gray-700'}
                  `}>
                    {index + 1}
                  </Text>
                )}
              </View>
              
              <Text className={`
                text-xs text-center px-1
                ${isCompleted ? 'text-blue-600 font-semibold' : 'text-gray-500'}
              `}>
                {typeof step === 'object' ? step.label : step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}