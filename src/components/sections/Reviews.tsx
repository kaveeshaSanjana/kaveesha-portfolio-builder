
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { MessageCircle, Star, StarHalf, Edit } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Google Sheet submission URL
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxi6uCFlKzNNFe8NfXQF_csIbgBxH_DjNnYyeBvQRsFwz_JaL-y52wwfnBz9PR8phpj/exec";

// Schema for review form validation
const reviewSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  review: z.string().min(5, { message: "Review must be at least 5 characters" }),
  rating: z.number().min(1).max(5),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

// Define review type
type Review = {
  name: string;
  review: string;
  rating: number;
};

// Sample initial reviews
const initialReviews: Review[] = [
  { name: "John Doe", review: "Excellent work! Very professional and responsive.", rating: 5 },
  { name: "Jane Smith", review: "Great attention to detail and deliverables were on time.", rating: 4.5 },
  { name: "Mike Johnson", review: "Fantastic developer with strong technical skills.", rating: 5 },
];

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form setup with validation
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: "",
      review: "",
      rating: 5,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create a new review object
      const newReview: Review = {
        name: data.name,
        review: data.review,
        rating: data.rating
      };
      
      // Submit to Google Sheet
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("review", data.review);
      formData.append("rating", data.rating.toString());
      
      // Make the fetch request to Google Sheet script
      await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        body: formData,
        mode: "no-cors" // This is required for Google Scripts
      });
      
      // Add the new review to the reviews array
      setReviews([...reviews, newReview]);
      
      // Show success toast
      toast.success("Review submitted! Thank you for your feedback.");
      
      // Reset form and close dialog
      form.reset();
      setDialogOpen(false);
      
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render stars based on rating
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-primary text-primary" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 text-primary" />);
    }
    
    return (
      <div className="flex space-x-1">
        {stars}
      </div>
    );
  };

  return (
    <section id="reviews" className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Reviews</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              What others say about my work
            </p>
          </div>

          {/* Reviews Carousel */}
          <div className="w-full max-w-4xl mx-auto my-8">
            <Carousel className="w-full">
              <CarouselContent>
                {reviews.map((review, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="overflow-hidden transition-all hover:shadow-lg">
                        <CardContent className="flex flex-col justify-between p-6 h-full min-h-[220px]">
                          <div>
                            {renderRatingStars(review.rating)}
                            <p className="mt-4 mb-4 italic">"{review.review}"</p>
                          </div>
                          <div className="mt-auto pt-4 border-t border-border">
                            <p className="text-sm font-medium text-primary">— {review.name}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-center w-full mt-4">
                <CarouselPrevious className="static translate-y-0 mr-2" />
                <CarouselNext className="static translate-y-0 ml-2" />
              </div>
            </Carousel>
          </div>

          {/* Add Review Button and Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Add Your Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Share Your Experience
                </DialogTitle>
                <DialogDescription>
                  Your feedback helps me improve and helps others make informed decisions.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Star
                                key={rating}
                                className={`h-6 w-6 cursor-pointer transition-all ${
                                  rating <= field.value ? "fill-primary text-primary" : "text-muted"
                                }`}
                                onClick={() => form.setValue("rating", rating)}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="review"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your thoughts..." 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
