import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import lufthansaLogo from "@/assets/lufthansa-logo.svg";
import heroTravelBg from "@/assets/hero-travel-bg.jpg";
import destinationBg from "@/assets/destination-bg.jpg";
import margotTeaser from "@/assets/margot-teaser.mp4";
import lufthansaA380 from "@/assets/lufthansa-a380.png";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'widget-embed': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'widget-config-url'?: string;
        'widget-config'?: string;
      }, HTMLElement>;
    }
  }
}

const Index = () => {
  const [showWidget, setShowWidget] = useState(false);
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const [delayedPosition, setDelayedPosition] = useState({
    x: 0,
    y: 0
  });
  const [isHovering, setIsHovering] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  // Create smooth following effect for cursor label
  useEffect(() => {
    let animationFrameId: number;
    const updateDelayedPosition = () => {
      setDelayedPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.1,
        y: prev.y + (mousePosition.y - prev.y) * 0.1
      }));
      animationFrameId = requestAnimationFrame(updateDelayedPosition);
    };
    animationFrameId = requestAnimationFrame(updateDelayedPosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePosition]);

  // Listen for Ojin tool calls (e.g. show_booking_popup)
  useEffect(() => {
    const handleToolCall = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('Ojin tool call:', detail);
      if (detail?.name === 'show_booking_popup') {
        setShowPopup(true);
      }
    };
    window.addEventListener('ojinToolCall', handleToolCall);
    return () => window.removeEventListener('ojinToolCall', handleToolCall);
  }, []);

  // Subscribe to booking popup Realtime channel when widget is shown
  useEffect(() => {
    if (!showWidget) return;
    console.log('Subscribing to booking-popup channel');
    const channel = supabase.channel('booking-popup').on('broadcast', {
      event: 'show_popup'
    }, payload => {
      console.log('Received popup event:', payload);
      setShowPopup(true);
    }).subscribe();
    return () => {
      console.log('Unsubscribing from booking-popup channel');
      supabase.removeChannel(channel);
    };
  }, [showWidget]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[hsl(213,100%,15%)] shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={lufthansaLogo} alt="Lufthansa Logo" className="h-8 w-auto brightness-0 invert" />
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <a href="https://www.lufthansa.com/de/en/homepage" className="text-white hover:text-white/80 transition-colors">
                Book & Prepare
              </a>
              <a href="https://www.lufthansa.com/de/en/homepage" className="text-white hover:text-white/80 transition-colors">
                My bookings
              </a>
              <a href="https://www.lufthansa.com/de/en/articles/explore-the-world" className="text-white hover:text-white/80 transition-colors">
                Discover Lufthansa
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Digital Human Section */}
        <section className="max-w-5xl mx-auto mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground text-center mb-6">Margot</h1>
          <div className="flex justify-center relative" ref={widgetContainerRef}>
            {/* Booking Popup */}
            {showPopup && <div
                className="absolute top-[35%] -translate-y-1/2 right-0 translate-x-1/2 z-50 animate-popup-fade-in w-[240px] opacity-95"
              >
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                  <button onClick={() => setShowPopup(false)} className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white/80 rounded-full p-1" aria-label="Close popup">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="aspect-video bg-gradient-to-b from-blue-400 to-blue-200 relative overflow-hidden">
                    <img src={lufthansaA380} alt="Lufthansa A380" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 text-center">
                    <h2 className="text-xl font-bold text-black mb-2">Lets Travel</h2>
                    <p className="text-gray-600 text-xs mb-4 leading-relaxed">
                      Your travel information is ready.<br />
                      Let's travel to the Lufthansa official website.
                    </p>
                    <a href="https://www.lufthansa.com/de/en/homepage" target="_blank" rel="noopener noreferrer" className="inline-block bg-black text-white hover:bg-[#FFC72C] hover:text-black font-medium py-2.5 px-8 rounded-full transition-colors text-xs">
                      Book A Flight
                    </a>
                  </div>
                </div>
              </div>}

            <div className="relative overflow-hidden rounded-2xl" style={{ width: '512px', height: '512px' }}>
              <widget-embed widget-config-url="/margot-config.json" style={{ display: 'block', width: '512px', height: '512px', borderRadius: '16px', overflow: 'hidden' }} />
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Available 24/7 to assist with bookings, travel information, and personalized recommendations
            </p>
          </div>
        </section>

        {/* Info Cards */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-card p-6 rounded-xl border border-border hover:shadow-elegant transition-shadow">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">
              Get instant assistance anytime, anywhere
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border hover:shadow-elegant transition-shadow">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Multi-Language</h3>
            <p className="text-sm text-muted-foreground">
              Communicate in your preferred language
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border hover:shadow-elegant transition-shadow">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Secure</h3>
            <p className="text-sm text-muted-foreground">
              Your data is protected with enterprise-grade security
            </p>
          </div>
        </section>

        {/* Related Articles Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a href="https://www.lufthansa.com/de/en/articles/explore-the-world" className="group">
              <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-elegant transition-shadow">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800&h=600&fit=crop" alt="Brooklyn Bridge, New York" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">October 1, 2025 | 3 min read | Antonia Esst</p>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    In My Hood: Out and About in Brooklyn, New York
                  </h3>
                </div>
              </div>
            </a>
            
            <a href="https://www.lufthansa.com/de/en/articles/explore-the-world" className="group">
              <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-elegant transition-shadow">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop" alt="New York Cuisine" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">October 1, 2025 | 1 min read | Antonia Esst</p>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Be Picky New York: Selected Tips from Insiders
                  </h3>
                </div>
              </div>
            </a>
            
            <a href="https://www.lufthansa.com/de/en/articles/explore-the-world" className="group">
              <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-elegant transition-shadow">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&h=600&fit=crop" alt="Lufthansa Aircraft" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">February 28, 2025 | 2 min read | Lufthansa Editorial Team</p>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    5 Facts About Lufthansa That Will Surprise You
                  </h3>
                </div>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src={lufthansaLogo} alt="Lufthansa Logo" className="h-8 w-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Connecting the world through exceptional travel experiences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Travel</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://www.lufthansa.com/de/en/homepage" className="hover:text-accent transition-colors">Book Flights</a></li>
                <li><a href="https://www.lufthansa.com/de/en/homepage" className="hover:text-accent transition-colors">Manage Bookings</a></li>
                <li><a href="https://www.lufthansa.com/de/en/homepage" className="hover:text-accent transition-colors">Flight Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Discover</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://www.lufthansa.com/de/en/articles/explore-the-world" className="hover:text-accent transition-colors">Travel Stories</a></li>
                <li><a href="https://www.lufthansa.com/de/en/articles/explore-the-world" className="hover:text-accent transition-colors">Destinations</a></li>
                <li><a href="https://www.lufthansa.com/de/en/articles/explore-the-world" className="hover:text-accent transition-colors">Travel Tips</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://www.lufthansa.com/de/en/homepage" className="hover:text-accent transition-colors">Help Center</a></li>
                <li><a href="https://www.lufthansa.com/de/en/homepage" className="hover:text-accent transition-colors">Contact Us</a></li>
                <li><a href="https://www.lufthansa.com/de/en/homepage" className="hover:text-accent transition-colors">FAQs</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Lufthansa. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="https://www.lufthansa.com/de/en/homepage" className="hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <a href="https://www.lufthansa.com/de/en/homepage" className="hover:text-accent transition-colors">
                Terms of Service
              </a>
              <a href="https://www.lufthansa.com/de/en/homepage" className="hover:text-accent transition-colors">
                Imprint
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;