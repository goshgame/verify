export function formatMonth(input: string) {
  if (!input) {
    return '';
  }

  // 解析输入的字符串
  const year = input.substring(0, 4);
  const monthNumber = parseInt(input.substring(4), 10);

  // 定义月份的英文缩写
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // 获取月份的英文缩写
  const monthName = months[monthNumber - 1];

  // 返回格式化的日期
  return `${year} ${monthName}`;
}
