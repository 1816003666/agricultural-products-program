const newsTemplates = [
  {
    title: '国务院发布最新经济政策，推动高质量发展',
    category: '经济',
    source: '新华网',
    sentiment: 'positive',
    content: '国务院今日发布最新经济发展政策，强调推动高质量发展，促进产业升级转型。政策涵盖科技创新、绿色发展、数字经济等多个领域，将为经济增长注入新动能。专家表示，这一系列政策措施有助于稳定市场预期，增强发展信心。'
  },
  {
    title: '科技巨头发布新一代人工智能产品',
    category: '科技',
    source: '科技日报',
    sentiment: 'positive',
    content: '今日，多家科技巨头同时发布了新一代人工智能产品，涵盖大语言模型、计算机视觉、自动驾驶等多个领域。业内人士认为，这标志着人工智能技术进入了新的发展阶段，将深刻改变人们的生产生活方式。'
  },
  {
    title: '某地发生食品安全问题，相关部门介入调查',
    category: '社会',
    source: '民生周刊',
    sentiment: 'negative',
    content: '近日，某地曝出食品安全问题，涉及多家知名餐饮企业。市场监管部门已成立专项调查组，对涉事企业进行全面检查。专家提醒消费者注意饮食安全，遇到问题及时举报。'
  },
  {
    title: '全球气候变化峰会达成重要共识',
    category: '政治',
    source: '国际观察',
    sentiment: 'positive',
    content: '为期两周的全球气候变化峰会今日落下帷幕，与会各国就减排目标达成重要共识。会议通过了多项决议，包括加快可再生能源发展、加强气候融资等。各方表示将共同应对气候变化挑战。'
  },
  {
    title: '股市震荡下行，投资者需保持谨慎',
    category: '经济',
    source: '财经时报',
    sentiment: 'negative',
    content: '今日股市继续震荡下行，主要指数均出现不同程度下跌。分析人士指出，受多重因素影响，市场情绪偏谨慎。建议投资者关注基本面，合理控制仓位，避免追涨杀跌。'
  },
  {
    title: '新能源汽车销量创历史新高',
    category: '科技',
    source: '汽车之家',
    sentiment: 'positive',
    content: '据最新统计数据显示，上月新能源汽车销量创历史新高，同比增长超过50%。业内分析认为，随着技术成熟和价格下降，新能源汽车越来越受到消费者青睐，市场前景广阔。'
  },
  {
    title: '文化产业蓬勃发展，新业态不断涌现',
    category: '娱乐',
    source: '文化报',
    sentiment: 'positive',
    content: '近年来，我国文化产业蓬勃发展，数字文化、沉浸式体验等新业态不断涌现。数据显示，文化产业增加值持续增长，成为经济增长的新亮点。政策支持和技术创新为产业发展提供了强劲动力。'
  },
  {
    title: '体育赛事圆满落幕，中国队表现出色',
    category: '体育',
    source: '体育周刊',
    sentiment: 'positive',
    content: '经过激烈角逐，本次体育赛事今日圆满落幕。中国代表团表现出色，获得多枚金牌，展现了良好的竞技状态和精神风貌。运动员们的拼搏精神赢得了观众的热烈掌声。'
  },
  {
    title: '某企业被曝存在环境污染问题',
    category: '社会',
    source: '环保在线',
    sentiment: 'negative',
    content: '近日，有群众举报某企业存在环境污染问题。环保部门已迅速介入调查，对涉事企业进行了现场检测。经查，该企业确实存在超标排放行为，已被责令停产整改。'
  },
  {
    title: '教育改革取得新进展，学生负担减轻',
    category: '社会',
    source: '教育报',
    sentiment: 'positive',
    content: '教育改革持续推进，取得新的进展。各地积极落实双减政策，学生课业负担明显减轻。同时，素质教育得到更多重视，学生综合素质不断提升。家长和社会对改革成效给予肯定。'
  },
  {
    title: '房地产市场持续调整，房价稳中有降',
    category: '经济',
    source: '房产观察',
    sentiment: 'negative',
    content: '房地产市场持续调整，主要城市房价稳中有降。专家分析认为，在房住不炒的政策基调下，市场回归理性。房企积极转型，探索新的发展模式。预计未来市场将以平稳运行为主。'
  },
  {
    title: '5G网络覆盖率大幅提升，应用场景不断丰富',
    category: '科技',
    source: '通信世界',
    sentiment: 'positive',
    content: '我国5G网络建设取得显著成效，覆盖率大幅提升。截至目前，全国已建成5G基站超过300万个，覆盖所有地级市和县城城区。5G应用场景不断丰富，在工业、医疗、教育等领域发挥重要作用。'
  },
  {
    title: '知名艺人涉嫌违法被调查',
    category: '娱乐',
    source: '娱乐头条',
    sentiment: 'negative',
    content: '今日，有消息称某知名艺人涉嫌违法被调查。相关部门已介入，案件正在进一步审理中。业内人士表示，艺人应当遵纪守法，树立良好榜样。此事引发社会广泛关注和讨论。'
  },
  {
    title: '医疗改革深入推进，看病难问题缓解',
    category: '社会',
    source: '健康报',
    sentiment: 'positive',
    content: '医疗改革深入推进，取得积极成效。分级诊疗制度逐步完善，基层医疗服务能力不断提升。群众看病难、看病贵问题得到有效缓解。医保覆盖范围扩大，保障水平稳步提高。'
  },
  {
    title: '国际贸易摩擦加剧，出口企业面临压力',
    category: '经济',
    source: '外贸导报',
    sentiment: 'negative',
    content: '近期国际贸易摩擦有所加剧，部分出口企业面临较大压力。专家建议企业加快转型升级，拓展多元化市场，降低对单一市场的依赖。政府也出台了多项扶持政策，帮助企业渡过难关。'
  }
];

const generateMockNews = (count = 50) => {
  const news = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const template = newsTemplates[i % newsTemplates.length];
    const publishOffset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
    const publishTime = new Date(now - publishOffset);

    const heatBase = template.sentiment === 'positive' ? 60 : template.sentiment === 'negative' ? 70 : 50;
    const heatVariation = Math.random() * 40;

    news.push({
      ...template,
      sourceUrl: `https://example.com/news/${i + 1000}`,
      publishTime,
      summary: template.content.substring(0, 100) + '...',
      author: ['记者A', '编辑B', '通讯员C', '特约撰稿人'][i % 4],
      sentimentScore: template.sentiment === 'positive' ? 0.3 + Math.random() * 0.4 :
                      template.sentiment === 'negative' ? -(0.3 + Math.random() * 0.4) :
                      (Math.random() - 0.5) * 0.2,
      heatIndex: Math.round((heatBase + heatVariation) * 10) / 10,
      keywords: [template.category],
      tags: []
    });
  }

  return news.sort((a, b) => b.publishTime - a.publishTime);
};

module.exports = { generateMockNews, newsTemplates };
