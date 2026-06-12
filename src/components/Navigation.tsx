import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Info } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">SurvayExtruderU</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant={location.pathname === "/classify" ? "default" : "ghost"}
              asChild
              size="sm"
              className={location.pathname === "/classify" ? "bg-blue-600 hover:bg-blue-700" : "text-gray-600 hover:text-gray-900"}
            >
              <Link to="/classify">Classification</Link>
            </Button>
            <Button
              variant={location.pathname === "/about" ? "default" : "ghost"}
              asChild
              size="sm"
              className={location.pathname === "/about" ? "bg-blue-600 hover:bg-blue-700" : "text-gray-600 hover:text-gray-900"}
            >
              <Link to="/about">
                <Info className="w-4 h-4 mr-2" />
                About
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};