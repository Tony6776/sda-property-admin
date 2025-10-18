import { Shield, Lock, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SecurityNotice = () => {
  return (
    <Card className="border-muted-foreground/20 bg-muted/20">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <div className="font-medium mb-1">Your Privacy & Security</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Lock className="h-3 w-3" />
                <span>All form data is encrypted and securely transmitted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3" />
                <span>We never share your information without consent</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityNotice;