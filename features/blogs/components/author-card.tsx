import { Card, CardContent } from "@/components/ui/card";
import { authorPath, type PublicAuthorProfile } from "@/features/blogs/server/public-authors";
import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { RichHtml } from "@/features/shared/components/rich-html";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

type Props = {
  author: PublicAuthorProfile;
};

export default function AuthorCard({ author }: Props) {
  const imageSrc = resolveMediaUrl(author.image || "/logo.png");

  return (
    <Link href={authorPath(author.slug)} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col items-center gap-4 p-6 text-center">
          <div className="relative size-28 overflow-hidden rounded-full ring-4 ring-brand/20 transition group-hover:ring-brand/40">
            <Image
              src={imageSrc}
              alt={author.image_alt || author.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-brand">
              {author.name}
            </h2>
            {author.job_title ? (
              <p className="text-sm font-semibold text-brand">{author.job_title}</p>
            ) : null}
            {author.bio ? (
              <RichHtml
                html={author.bio}
                className="line-clamp-3 text-sm leading-relaxed text-muted-foreground [&_p]:mb-0"
              />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
