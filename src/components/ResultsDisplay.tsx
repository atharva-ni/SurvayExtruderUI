import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, Download, FileText, TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from "lucide-react";

interface ResultsDisplayProps {
  results: any;
  isRunning: boolean;
}

export const ResultsDisplay = ({ results, isRunning }: ResultsDisplayProps) => {
  const downloadFile = (data: any[], filename: string) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ];
    
    return csvRows.join('\n');
  };

  const getChangeIndicator = (before: number, after: number) => {
    const change = after - before;
    const percentChange = before > 0 ? ((change / before) * 100).toFixed(1) : '0.0';
    
    if (change > 0) {
      return { icon: TrendingUp, color: 'text-green-600', sign: '+' };
    } else if (change < 0) {
      return { icon: TrendingDown, color: 'text-red-600', sign: '' };
    } else {
      return { icon: CheckCircle, color: 'text-gray-600', sign: '' };
    }
  };

  return (
    <Card className="p-6 border border-gray-200 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Step 3: Analysis Results
        </h2>
        <p className="text-gray-600">
          Classification results and metrics will appear here
        </p>
      </div>

      <div className="min-h-[200px] flex items-center justify-center">
        {isRunning ? (
          <div className="text-center">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse"></div>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Processing Your Dataset...
            </p>
            <p className="text-gray-600">
              AI is analyzing your academic papers and generating insights
            </p>
          </div>
        ) : results ? (
          <div className="w-full space-y-6">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">
                      Classification Complete!
                    </h3>
                    <p className="text-green-600">Your dataset has been successfully processed</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {results.processingTime}
                </Badge>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Papers</p>
                    <p className="text-2xl font-bold text-blue-800">{results.totalPapers.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Survey Papers</p>
                    <p className="text-2xl font-bold text-orange-800">{results.surveyPapers.toLocaleString()}</p>
                    <p className="text-xs text-orange-600">{results.percentPapersExcluded}% of total</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Clean Papers</p>
                    <p className="text-2xl font-bold text-green-800">{results.nonSurveyPapers.toLocaleString()}</p>
                    <p className="text-xs text-green-600">Ready for analysis</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Impact Analysis */}
            <Card className="p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">Research Impact Analysis</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">H-Index</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{results.hIndexBefore}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-bold text-green-600">{results.hIndexAfter}</span>
                      {(() => {
                        const indicator = getChangeIndicator(results.hIndexBefore, results.hIndexAfter);
                        const Icon = indicator.icon;
                        return <Icon className={`w-4 h-4 ${indicator.color}`} />;
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">i10-Index</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{results.i10Before.toLocaleString()}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-bold text-green-600">{results.i10After.toLocaleString()}</span>
                      {(() => {
                        const indicator = getChangeIndicator(results.i10Before, results.i10After);
                        const Icon = indicator.icon;
                        return <Icon className={`w-4 h-4 ${indicator.color}`} />;
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Total Citations</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{results.totalCitations.toLocaleString()}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-bold text-green-600">{results.remainingCitations.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Citations Excluded</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600">{results.excludedCitations.toLocaleString()}</span>
                      <span className="text-orange-600 text-sm">({results.percentCitationsExcluded}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Download Section */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-900">Download Results</h4>
                  <p className="text-blue-700">Get your processed datasets and analysis reports</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => downloadFile(results.allNonSurveyData || [], 'Non-Survey-Papers.csv')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Clean Dataset
                  <Badge className="ml-2 bg-green-500">{results.nonSurveyPapers} papers</Badge>
                </Button>
                
                <Button 
                  onClick={() => downloadFile(results.allSurveyData || [], 'Survey-Papers.csv')}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Survey Papers
                  <Badge className="ml-2 bg-orange-100 text-orange-700">{results.surveyPapers} papers</Badge>
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>✓ Clean Dataset:</strong> Contains only non-survey papers ready for research analysis<br/>
                  <strong>✓ Survey Papers:</strong> Identified survey papers for reference and validation
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center opacity-50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500 font-medium">
              Ready for Analysis
            </p>
            <p className="text-gray-400">
              Upload a file and run classification to see results
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};