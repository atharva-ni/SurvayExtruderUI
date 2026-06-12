import { Upload, Play, BarChart3 } from "lucide-react";

interface WorkflowStepsProps {
  currentStep: number;
}

export const WorkflowSteps = ({ currentStep }: WorkflowStepsProps) => {
  const steps = [
    { number: 1, title: "Upload Dataset", icon: Upload, description: "Academic papers CSV" },
    { number: 2, title: "Classify Papers", icon: Play, description: "AI survey detection" },
    { number: 3, title: "View Analysis", icon: BarChart3, description: "Detailed metrics" },
  ];

  return (
    <div className="flex justify-center">
      <div className="flex gap-6 max-w-2xl">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <div key={step.number} className="flex items-center">
              <div className="text-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={`w-8 h-0.5 mx-3 transition-colors duration-200 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`} 
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};