const mongoose = require('mongoose');

// Copy Item schema exactly from models/Item.js
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    isVeg: { type: Boolean, default: true },
    image: { type: String },
    inStock: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

async function fixDescriptions() {
    try {
        // Connect to same DB as server
        await mongoose.connect('mongodb://localhost:27017/fullstack_cafe');
        console.log('✅ Connected to MongoDB');

        // Fetch all items
        const items = await Item.find({});
        console.log(`\\n📋 Found ${items.length} items:`);

        // Log current descriptions
        items.forEach((item, index) => {
            console.log(`${index + 1}. "${item.name}": "${item.description?.substring(0, 50)}..."`);
        });

        // Proper descriptions mapped by common names (adjust if needed)
        const descriptionMap = {
            'espresso': 'Classic Italian espresso shot with rich crema and bold flavor.',
            'cappuccino': 'Velvety espresso with steamed milk and frothy foam topping.',
            'latte': 'Smooth espresso blended with steamed milk, subtle sweetness.',
            'americano': 'Bold espresso diluted with hot water for a lighter coffee experience.',
            'coffee': 'Freshly brewed aromatic coffee, perfect start to your day.',
            'croissant': 'Flaky buttery French croissant, baked fresh daily.',
            'muffin': 'Moist blueberry muffin with crunchy sugar topping.',
            'sandwich': 'Freshly made sandwich with premium ingredients.',
            'pasta': 'House-made pasta with authentic Italian flavors.',
            default: 'Delicious cafe specialty made with fresh ingredients.'
        };

        let updatedCount = 0;
        for (const item of items) {
            const key = item.name?.toLowerCase().trim() || 'default';
            const newDesc = descriptionMap[key] || descriptionMap.default;

            if (item.description !== newDesc) {
                item.description = newDesc;
                await item.save();
                updatedCount++;
                console.log(`✏️ Updated "${item.name}": "${newDesc}"`);
            } else {
                console.log(`✅ "${item.name}" already good`);
            }
        }

        console.log(`\\n🎉 Successfully fixed ${updatedCount} descriptions!`);
        console.log('🔄 Restart server (npm start) and refresh browser.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

fixDescriptions();
