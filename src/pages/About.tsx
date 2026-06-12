import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Zap, Shield, BarChart3, FileText } from "lucide-react";

const About = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            About SurvayExtruderU
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional machine learning system for identifying and filtering survey papers 
            from academic research datasets with high accuracy and reliability.
          </p>
        </div>

        <div className="grid gap-8 max-w-6xl mx-auto">
          {/* Methodology Section */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Hybrid Classification Methodology</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Keyword-Based Detection</h3>
                <p className="text-muted-foreground">
                  Our system first applies rule-based filtering using carefully curated survey keywords:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["survey", "review", "overview", "comparative", "taxonomy", "state of the art", "systematic"].map((keyword) => (
                    <Badge key={keyword} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">DistilBERT Deep Learning</h3>
                <p className="text-muted-foreground">
                  For papers not caught by keywords, we deploy a fine-tuned DistilBERT model that analyzes 
                  the semantic content of titles and abstracts to identify survey characteristics with high precision.
                </p>
              </div>
            </div>
          </Card>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">High Accuracy</h3>
              <p className="text-muted-foreground">
                Hybrid approach achieves superior accuracy compared to single-method classification
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Zap className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Fast Processing</h3>
              <p className="text-muted-foreground">
                Optimized GPU acceleration for rapid batch processing of large academic datasets
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="w-12 h-12 text-warning mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Robust Pipeline</h3>
              <p className="text-muted-foreground">
                Handles missing data gracefully and provides detailed validation reports
              </p>
            </Card>
          </div>

          {/* Technical Details */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Output Metrics & Analysis</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Generated Reports</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-success" />
                    <strong>Non-Survey-Papers.csv</strong> - Cleaned dataset for analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-warning" />
                    <strong>Survey-Papers.csv</strong> - Identified survey papers
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Impact Metrics</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>H-Index</strong> calculation before/after filtering</li>
                  <li>• <strong>i10-Index</strong> analysis for research impact</li>
                  <li>• <strong>Citation analysis</strong> with exclusion statistics</li>
                  <li>• <strong>Percentage breakdown</strong> of papers and citations</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Data Requirements */}
          <Card className="p-8 bg-accent/5 border-accent/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Requirements</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Required Columns</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><code className="bg-muted px-2 py-1 rounded">title</code> - Paper title</li>
                  <li><code className="bg-muted px-2 py-1 rounded">abstract</code> - Paper abstract</li>
                  <li><code className="bg-muted px-2 py-1 rounded">n_citation</code> - Citation count</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">File Format</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• CSV format with UTF-8 encoding</li>
                  <li>• Maximum file size: 100MB</li>
                  <li>• Headers in first row</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Data Quality</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Empty rows automatically removed</li>
                  <li>• Missing citations handled as zero</li>
                  <li>• Text preprocessing included</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Team Section */}
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Research & Development</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              This system was developed to address the critical need for automated survey paper identification 
              in academic research workflows. Our hybrid approach combines the interpretability of rule-based 
              methods with the power of transformer-based deep learning.
            </p>
            
            <div className="flex justify-center gap-4 mt-6">
              <Badge variant="outline" className="px-4 py-2">Machine Learning</Badge>
              <Badge variant="outline" className="px-4 py-2">Natural Language Processing</Badge>
              <Badge variant="outline" className="px-4 py-2">Academic Research</Badge>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default About;