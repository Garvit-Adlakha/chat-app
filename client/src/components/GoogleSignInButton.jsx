import { useState, useEffect, useRef } from "react";
import { IconBrandGoogle } from '@tabler/icons-react';

const GOOGLE_SCRIPT_ID = "google-signin-script";
const MAX_RETRIES = 3;

const GoogleSignInButton = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonRef = useRef(null);
  
  // Function to check if Google API is loaded
  const isGoogleScriptLoaded = () => {
    return typeof window !== "undefined" && 
           typeof window.google !== "undefined" &&
           typeof window.google.accounts !== "undefined";
  };
  
  // Load Google Sign-In SDK
  useEffect(() => {
    if (document.getElementById(GOOGLE_SCRIPT_ID)) {
      if (isGoogleScriptLoaded()) {
        setScriptLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setScriptLoaded(true);
    };
    
    script.onerror = () => {
      onError("Google Sign-In service unavailable");
    };
    
    document.body.appendChild(script);
    
    // Cleanup
    return () => {
      // We don't remove the script since other components might use it
      // Instead, we just cleanup any Google Auth instances
      if (isGoogleScriptLoaded() && window.google.accounts.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [onError]);
  
  // Initialize Google Sign-In
  useEffect(() => {
    if (!scriptLoaded) return;
    
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        onError("Google Sign-In configuration missing");
        return;
      }
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError("Google authentication failed");
          }
          setIsLoading(false);
        },
        cancel_on_tap_outside: true,
        context: "signin",
        itp_support: true,
        use_fedcm_for_prompt: true,
        error_callback: (error) => {
          console.error("Google Sign-In error:", error);
          
          let errorMessage = "Google Sign-In failed";
          
          if (error.type === 'fedcmError') {
            if (error.reason === 'browserNotSupported') {
              errorMessage = "Your browser doesn't support the latest sign-in features";
            } else if (error.reason === 'configurationError') {
              errorMessage = "Google Sign-In configuration error";
            } else if (error.reason === 'networkError') {
              errorMessage = "Network error occurred";
            }
          }
          
          onError(errorMessage);
          setIsLoading(false);
        },
      });
      
      // Render the button if buttonRef is available
      renderButton();
    } catch (error) {
      onError("Failed to initialize Google Sign-In");
    }
  }, [scriptLoaded, onSuccess, onError]);
  
  // Render the button when the ref is available and Google is loaded
  useEffect(() => {
    if (scriptLoaded && buttonRef.current) {
      renderButton();
    }
  }, [scriptLoaded, buttonRef.current]);
  
  // Render Google button
  const renderButton = () => {
    if (!isGoogleScriptLoaded() || !buttonRef.current) return;
    
    try {
      // Clear any existing content
      buttonRef.current.innerHTML = '';
      
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: buttonRef.current.offsetWidth || 240
      });
    } catch (error) {
      console.error("Failed to render Google button:", error);
      onError("Failed to display Google Sign-In button");
    }
  };
  
  // Fallback button in case rendering fails
  const handleManualSignIn = () => {
    setIsLoading(true);
    
    if (!isGoogleScriptLoaded()) {
      onError("Google Sign-In service unavailable");
      setIsLoading(false);
      return;
    }
    
    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.warn("Google Sign-In prompt not displayed:", reason);
          
          let errorMessage = "Google Sign-In unavailable";
          
          if (reason === 'browser_not_supported') {
            errorMessage = "Browser not supported for Google Sign-In";
          } else if (reason === 'secure_context_required') {
            errorMessage = "Secure connection required for Google Sign-In";
          } else if (reason === 'storage_access_required') {
            errorMessage = "Please allow cookies for Google Sign-In";
          }
          
          onError(errorMessage);
          setIsLoading(false);
        } else if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
          setIsLoading(false);
        }
      });
    } catch (error) {
      onError("Failed to show Google Sign-In");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
        {/* Loading spinner */}
      {/* Google's rendered button */}
      <div 
        ref={buttonRef} 
        className="google-signin-button w-full min-h-[40px] flex items-center justify-center "
      />
      
      {/* Fallback button if Google's button doesn't render */}
      {!scriptLoaded && (
        <button
          type="button"
          onClick={handleManualSignIn}
          disabled={isLoading}
          className="btn flex-1 bg-white  hover:bg-gray-100 text-gray-800 font-semibold border-none"
        >
          <IconBrandGoogle className="w-5 h-5 mr-2" />
          <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>
      )}
    </div>
  );
};

export default GoogleSignInButton;
