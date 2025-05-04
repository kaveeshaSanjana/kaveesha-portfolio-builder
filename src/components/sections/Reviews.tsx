
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { MessageCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Schema for review form validation
const reviewSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  review: z.string().min(5, { message: "Review must be at least 5 characters" }),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

// Define review type to avoid TS errors
type Review = {
  name: string;
  review: string;
};

// Sample initial reviews
const initialReviews: Review[] = [
  { name: "John Doe", review: "Excellent work! Very professional and responsive." },
  { name: "Jane Smith", review: "Great attention to detail and deliverables were on time." },
  { name: "Mike Johnson", review: "Fantastic developer with strong technical skills." },
];

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  
  // Form setup with validation
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: "",
      review: "",
    },
  });

  // Handle form submission
  const onSubmit = (data: ReviewFormValues) => {
    // Add the new review to the reviews array
    setReviews([...reviews, data]);
    
    // Save to "Excel" (in real app would use a backend API)
    // This currently simulates saving by creating a downloadable CSV
    const csvData = [...reviews, data]
      .map(item => `${item.name},${item.review.replace(/,/g, ' ')}`)
      .join('\n');
    
    // In a real app, you would send this data to a backend API
    console.log("Saving to Excel:", csvData);
    
    // Show success toast
    toast.success("Review submitted! Thank you for your feedback.");
    
    // Reset form
    form.reset();
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
                      <Card>
                        <CardContent className="flex flex-col justify-between p-6 h-full min-h-[200px]">
                          <div>
                            <p className="mb-4 italic">"{review.review}"</p>
                          </div>
                          <div className="mt-auto">
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

          {/* Add Review Form */}
          <div className="w-full max-w-md mx-auto mt-8 p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Add Your Review
            </h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Review</FormLabel>
                      <FormControl>
                        <Input placeholder="Share your thoughts..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Submit Review</Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
