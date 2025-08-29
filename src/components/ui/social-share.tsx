import { Button } from "@/components/ui/button";
import { Share2, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
}

export function SocialShare({ url, title, description, hashtags }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || "");
  const encodedHashtags = hashtags ? encodeURIComponent(hashtags.join(",")) : "";

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    instagram: `https://www.instagram.com/` // Instagram doesn't support direct sharing via URL
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === 'instagram') {
      // For Instagram, we'll copy to clipboard since they don't support direct URL sharing
      navigator.clipboard.writeText(`${title}\n${url}`);
      return;
    }
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')} className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('instagram')} className="cursor-pointer">
          <div className="h-4 w-4 mr-2 rounded bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"></div>
          Instagram (copiar)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}