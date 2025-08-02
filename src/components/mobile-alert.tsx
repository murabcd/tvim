import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Monitor, X } from "lucide-react";

export function MobileAlert() {
	const [isMobile, setIsMobile] = useState(false);
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	if (!isMobile || !isVisible) return null;

	return (
		<div className="fixed top-20 left-4 right-4 z-50">
			<Alert className="relative">
				<Monitor className="h-4 w-4" />
				<AlertTitle>Mobile not supported yet</AlertTitle>
				<AlertDescription>
					This todo is optimized for desktop use. Please use a web browser on
					your computer for the best experience.
				</AlertDescription>
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 h-6 w-6"
					onClick={() => setIsVisible(false)}
				>
					<X className="h-4 w-4" />
				</Button>
			</Alert>
		</div>
	);
}
