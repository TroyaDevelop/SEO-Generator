// Заглушка: генерация семантики по ключевому слову
export async function generateSemanticsHandler(req, res) {
  const { keyword } = req.body;
  if (!keyword || typeof keyword !== 'string' || keyword.trim().length < 3) {
    return res.status(400).json({ error: 'Некорректное ключевое слово' });
  }
  // Здесь будет реальный вызов бота/алгоритма
  const fake = [
    'купить окна',
    'цены на окна',
    'пластиковые окна',
    'монтаж окон',
    'установка окон',
    'ремонт окон',
    'окна ПВХ',
    'энергосберегающие окна',
    'окна для дачи',
    'окна в квартиру',
  ];
  res.json({ semantics: fake });
}