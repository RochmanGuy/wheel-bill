import { Link } from 'react-router-dom'

export default function AccessibilityPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto" dir="rtl">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none rounded">→ חזרה לאתר</Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">הצהרת נגישות</h1>

      <div className="space-y-6 text-gray-700">

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">כללי</h2>
          <p>אתר <strong>WHEEL BILL</strong> מחויב לספק שירות נגיש לכלל המשתמשים, לרבות אנשים עם מוגבלויות, בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013, ובהתאם לתקן הישראלי 5568 המבוסס על הנחיות WCAG 2.1 ברמה AA.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">רמת הנגישות</h2>
          <p>האתר עומד ברמת נגישות <strong>AA</strong> בהתאם לתקן WCAG 2.1.</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>כל הכפתורים והקישורים מכילים תיאור נגיש לקוראי מסך</li>
            <li>כל שדות הטופס מקושרים לתוויות מתאימות</li>
            <li>ניגודיות הצבעים עומדת בדרישות התקן</li>
            <li>האתר תומך בניווט מקלדת מלא</li>
            <li>האתר תומך בכיוון קריאה מימין לשמאל (RTL)</li>
            <li>האתר מותאם לשימוש במכשירים ניידים</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">תאריך עדכון</h2>
          <p>הצהרת נגישות זו עודכנה לאחרונה באפריל 2026.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">פנייה בנושא נגישות</h2>
          <p>נתקלתם בבעיה? אנחנו כאן לעזור.</p>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-semibold text-gray-800">גיא</p>
            <p className="text-sm text-gray-600 mt-1">רכז נגישות</p>
            <a
              href="mailto:wheel6ill@gmail.com"
              className="text-blue-600 text-sm mt-1 block focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
            >
              wheel6ill@gmail.com
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-3">נשתדל לטפל בפנייה תוך 5 ימי עסקים.</p>
        </section>

      </div>
    </div>
  )
}
