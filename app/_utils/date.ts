export const formatDate = (
  date: Date,
  opts: Intl.DateTimeFormatOptions = {}
) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    ...opts,
  };

  const formatter = Intl.DateTimeFormat("en-US", options);

  return formatter.format(date);
};
