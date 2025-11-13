export const formatNumber = (num) => {
  if (isNaN(num)) return "0";
  return num.toLocaleString("ko-KR");
};
