export default function ListingInfoSection({ listing, formatDate }) {
  return (
    <>
      <span className="mb-2 font-bold text-2xl text-primary">
        RM{listing.price}
      </span>
      {listing.sizes && (
        <span className="block mb-1">Size: {listing.sizes}</span>
      )}
      {listing.gender && (
        <span className="block mb-1">Gender: {listing.gender}</span>
      )}
      {listing.category && (
        <span className="block mb-1">Category: {listing.category}</span>
      )}
      <span className="block font-semibold text-lg text-primary mt-3">
        Description:
      </span>
      {listing.description && (
        <span className="block mb-2 text-muted-foreground text-base">
          {listing.description}
        </span>
      )}
      <span className="mb-2">Date Posted: {formatDate(listing.date)}</span>
      <br />
    </>
  );
}
