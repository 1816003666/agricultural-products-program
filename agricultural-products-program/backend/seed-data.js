// 数据种子脚本
const sequelize = require("./config/database");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Coupon = require("./models/Coupon");

const seedData = async () => {
  try {
    console.log("开始添加示例数据...");

    // 添加分类
    const categories = [
      { name: "水果", description: "新鲜水果" },
      { name: "蔬菜", description: "新鲜蔬菜" },
      { name: "肉禽蛋", description: "肉类、禽类和蛋类" },
      { name: "水产", description: "水产品" },
      { name: "粮油", description: "粮食和食用油" },
      { name: "干货", description: "干货产品" },
    ];

    for (const category of categories) {
      await Category.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });
    }

    console.log("分类添加完成");

    // 获取分类
    const fruitCategory = await Category.findOne({ where: { name: "水果" } });
    const vegetableCategory = await Category.findOne({
      where: { name: "蔬菜" },
    });
    const meatCategory = await Category.findOne({ where: { name: "肉禽蛋" } });
    const seafoodCategory = await Category.findOne({ where: { name: "水产" } });
    const grainCategory = await Category.findOne({ where: { name: "粮油" } });
    const dryCategory = await Category.findOne({ where: { name: "干货" } });

    // 添加产品
    const products = [
      // 水果
      {
        category_id: fruitCategory.id,
        name: "新鲜苹果",
        description: "山东红富士苹果，脆甜多汁，富含维生素C",
        price: 12.99,
        original_price: 15.99,
        discount: 20,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20apples%20farm%20fresh&image_size=square",
        stock: 100,
        sold: 50,
      },
      {
        category_id: fruitCategory.id,
        name: "精选草莓",
        description: "云南高原草莓，香甜可口，新鲜直达",
        price: 29.99,
        original_price: 39.99,
        discount: 25,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20strawberries%20farm%20fresh&image_size=square",
        stock: 50,
        sold: 20,
      },
      {
        category_id: fruitCategory.id,
        name: "进口橙子",
        description: "南非进口橙子，果肉饱满，汁多味甜",
        price: 19.99,
        original_price: 24.99,
        discount: 20,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20oranges%20farm%20fresh&image_size=square",
        stock: 80,
        sold: 30,
      },
      {
        category_id: fruitCategory.id,
        name: "新疆香梨",
        description: "新疆库尔勒香梨，肉质细腻，清脆爽口",
        price: 15.99,
        original_price: 19.99,
        discount: 20,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pears%20farm%20fresh&image_size=square",
        stock: 60,
        sold: 25,
      },
      // 蔬菜
      {
        category_id: vegetableCategory.id,
        name: "有机生菜",
        description: "有机种植生菜，新鲜脆嫩，富含营养",
        price: 8.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20lettuce%20organic%20vegetable&image_size=square",
        stock: 120,
        sold: 60,
      },
      {
        category_id: vegetableCategory.id,
        name: "西红柿",
        description: "山东寿光西红柿，酸甜可口，自然成熟",
        price: 6.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20tomatoes%20farm%20fresh&image_size=square",
        stock: 150,
        sold: 80,
      },
      {
        category_id: vegetableCategory.id,
        name: "黄瓜",
        description: "新鲜黄瓜，清脆爽口，适合凉拌",
        price: 4.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cucumbers%20farm%20fresh&image_size=square",
        stock: 200,
        sold: 100,
      },
      {
        category_id: vegetableCategory.id,
        name: "西兰花",
        description: "新鲜西兰花，营养丰富，口感鲜美",
        price: 9.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20broccoli%20farm%20fresh&image_size=square",
        stock: 80,
        sold: 40,
      },
      // 肉禽蛋
      {
        category_id: meatCategory.id,
        name: "土鸡蛋",
        description: "农家散养土鸡蛋，营养丰富，口感鲜美",
        price: 29.99,
        original_price: 35.99,
        discount: 17,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20eggs%20farm%20fresh&image_size=square",
        stock: 200,
        sold: 120,
      },
      {
        category_id: meatCategory.id,
        name: "新鲜猪肉",
        description: "土猪五花肉，肥瘦相间，肉质鲜美",
        price: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pork%20meat%20farm%20fresh&image_size=square",
        stock: 100,
        sold: 60,
      },
      {
        category_id: meatCategory.id,
        name: "鸡肉",
        description: "散养土鸡，肉质紧实，味道鲜美",
        price: 25.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20chicken%20meat%20farm%20fresh&image_size=square",
        stock: 80,
        sold: 40,
      },
      {
        category_id: meatCategory.id,
        name: "牛肉",
        description: "新鲜牛肉，肉质鲜嫩，营养丰富",
        price: 69.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20beef%20meat%20farm%20fresh&image_size=square",
        stock: 50,
        sold: 30,
      },
      // 水产
      {
        category_id: seafoodCategory.id,
        name: "新鲜虾",
        description: "活虾现捕，肉质鲜美，营养丰富",
        price: 49.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shrimp%20seafood&image_size=square",
        stock: 60,
        sold: 40,
      },
      {
        category_id: seafoodCategory.id,
        name: "鱼",
        description: "新鲜活鱼，肉质鲜嫩，味道鲜美",
        price: 29.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fish%20seafood&image_size=square",
        stock: 80,
        sold: 50,
      },
      {
        category_id: seafoodCategory.id,
        name: "螃蟹",
        description: "新鲜螃蟹，肉质鲜美，营养丰富",
        price: 89.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20crab%20seafood&image_size=square",
        stock: 40,
        sold: 25,
      },
      {
        category_id: seafoodCategory.id,
        name: "贝类",
        description: "新鲜贝类，肉质鲜嫩，味道鲜美",
        price: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shellfish%20seafood&image_size=square",
        stock: 100,
        sold: 60,
      },
      // 粮油
      {
        category_id: grainCategory.id,
        name: "大米",
        description: "东北大米，颗粒饱满，口感香糯",
        price: 59.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20rice%20grain&image_size=square",
        stock: 150,
        sold: 80,
      },
      {
        category_id: grainCategory.id,
        name: "面粉",
        description: "优质面粉，粉质细腻，适合各种面食",
        price: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20flour%20grain&image_size=square",
        stock: 120,
        sold: 60,
      },
      {
        category_id: grainCategory.id,
        name: "食用油",
        description: "压榨花生油，香味浓郁，营养健康",
        price: 89.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cooking%20oil&image_size=square",
        stock: 100,
        sold: 50,
      },
      {
        category_id: grainCategory.id,
        name: "面条",
        description: "手工面条，口感筋道，营养健康",
        price: 19.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20noodles&image_size=square",
        stock: 200,
        sold: 100,
      },
      // 干货
      {
        category_id: dryCategory.id,
        name: "香菇",
        description: "干香菇，香味浓郁，营养丰富",
        price: 49.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20shiitake%20mushrooms&image_size=square",
        stock: 80,
        sold: 40,
      },
      {
        category_id: dryCategory.id,
        name: "木耳",
        description: "黑木耳，肉质肥厚，营养丰富",
        price: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20black%20fungus&image_size=square",
        stock: 100,
        sold: 50,
      },
      {
        category_id: dryCategory.id,
        name: "红枣",
        description: "新疆红枣，果肉饱满，甜度高",
        price: 29.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20red%20dates&image_size=square",
        stock: 150,
        sold: 80,
      },
      {
        category_id: dryCategory.id,
        name: "枸杞",
        description: "宁夏枸杞，颗粒饱满，营养丰富",
        price: 59.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20wolfberries&image_size=square",
        stock: 120,
        sold: 60,
      },
    ];

    for (const product of products) {
      await Product.findOrCreate({
        where: { name: product.name },
        defaults: product,
      });
    }

    console.log("产品添加完成");

    // 添加优惠券
    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

    const coupons = [
      {
        code: "WELCOME10",
        name: "欢迎新用户",
        type: "percentage",
        value: 10,
        min_amount: 50,
        max_discount: 20,
        total_count: 1000,
        used_count: 0,
        start_date: now,
        end_date: threeMonthsLater,
        status: "active",
      },
      {
        code: "FRESH20",
        name: "新鲜满减",
        type: "fixed",
        value: 20,
        min_amount: 100,
        total_count: 500,
        used_count: 0,
        start_date: now,
        end_date: threeMonthsLater,
        status: "active",
      },
      {
        code: "SUMMER30",
        name: "夏季特惠",
        type: "percentage",
        value: 15,
        min_amount: 80,
        max_discount: 30,
        total_count: 300,
        used_count: 0,
        start_date: now,
        end_date: sixMonthsLater,
        status: "active",
      },
      {
        code: "VIP50",
        name: "VIP专享",
        type: "fixed",
        value: 50,
        min_amount: 200,
        total_count: 100,
        used_count: 0,
        start_date: now,
        end_date: oneMonthLater,
        status: "active",
      },
      {
        code: "FRUIT5",
        name: "水果专享",
        type: "percentage",
        value: 5,
        min_amount: 30,
        max_discount: 10,
        total_count: 800,
        used_count: 0,
        start_date: now,
        end_date: threeMonthsLater,
        status: "active",
      },
    ];

    for (const coupon of coupons) {
      await Coupon.findOrCreate({
        where: { code: coupon.code },
        defaults: coupon,
      });
    }

    console.log("优惠券添加完成");
    console.log("示例数据添加成功！");
  } catch (error) {
    console.error("添加示例数据失败:", error);
  } finally {
    process.exit();
  }
};

seedData();
