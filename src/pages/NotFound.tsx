import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The requested page does not exist.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Return to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
