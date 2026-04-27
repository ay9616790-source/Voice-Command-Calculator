
public class Calculator {

    private String expression = "";

    // ================= BASIC METHODS =================

    public void appendNumber(int num) {
        expression += num;
    }

    public void appendDecimal() {
        if (!expression.endsWith(".") &&
                (expression.isEmpty() ||
                 Character.isDigit(expression.charAt(expression.length() - 1)))) {
            expression += ".";
        }
    }

    public void appendOperator(char operator) {
        if (!expression.isEmpty() &&
                !isOperator(expression.charAt(expression.length() - 1))) {
            expression += " " + operator + " ";
        }
    }

    private boolean isOperator(char ch) {
        return ch == '+' || ch == '-' || ch == '*' || ch == '/';
    }

    public void deleteLast() {
        if (!expression.isEmpty()) {
            expression = expression.substring(0, expression.length() - 1);
        }
    }

    public void clear() {
        expression = "";
    }

    public String getExpression() {
        return expression.isEmpty() ? "0" : expression;
    }

    // ================= CALCULATION =================

    public double calculate() throws Exception {
        if (expression.isEmpty()) return 0;
        return evaluateExpression(expression);
    }

    private double evaluateExpression(String expr) throws Exception {

        expr = expr.replaceAll("\\s+", "");

        // First handle multiplication & division
        expr = handleMultiplicationDivision(expr);

        // Then handle addition & subtraction
        expr = handleAdditionSubtraction(expr);

        return Double.parseDouble(expr);
    }

    private String handleMultiplicationDivision(String expr) throws Exception {

        while (expr.contains("*") || expr.contains("/")) {

            int mulIndex = expr.indexOf("*");
            int divIndex = expr.indexOf("/");

            int opIndex;
            char op;

            if (mulIndex == -1) {
                opIndex = divIndex;
                op = '/';
            } else if (divIndex == -1) {
                opIndex = mulIndex;
                op = '*';
            } else {
                if (mulIndex < divIndex) {
                    opIndex = mulIndex;
                    op = '*';
                } else {
                    opIndex = divIndex;
                    op = '/';
                }
            }

            // LEFT OPERAND
            int leftStart = opIndex - 1;
            while (leftStart > 0 &&
                    (Character.isDigit(expr.charAt(leftStart - 1)) ||
                     expr.charAt(leftStart - 1) == '.')) {
                leftStart--;
            }

            double left = Double.parseDouble(expr.substring(leftStart, opIndex));

            // RIGHT OPERAND
            int rightStart = opIndex + 1;

            if (rightStart < expr.length() &&
                    expr.charAt(rightStart) == '-') {
                rightStart++;
            }

            int rightEnd = rightStart;

            while (rightEnd < expr.length() &&
                    (Character.isDigit(expr.charAt(rightEnd)) ||
                     expr.charAt(rightEnd) == '.')) {
                rightEnd++;
            }

            double right = Double.parseDouble(expr.substring(opIndex + 1, rightEnd));

            double result;

            if (op == '*') {
                result = left * right;
            } else {
                if (right == 0) {
                    throw new Exception("Division by zero");
                }
                result = left / right;
            }

            expr = expr.substring(0, leftStart) +
                   result +
                   expr.substring(rightEnd);
        }

        return expr;
    }

    private String handleAdditionSubtraction(String expr) {

        if (expr.startsWith("-")) {
            expr = "0" + expr;
        }

        double accumulator = 0;
        double currentNumber = 0;
        char lastOperator = '+';

        for (int i = 0; i < expr.length(); i++) {

            char ch = expr.charAt(i);

            if (Character.isDigit(ch) || ch == '.') {

                int start = i;
                while (i < expr.length() &&
                        (Character.isDigit(expr.charAt(i)) ||
                         expr.charAt(i) == '.')) {
                    i++;
                }

                currentNumber = Double.parseDouble(expr.substring(start, i));
                i--;

            } else if (ch == '+' || ch == '-') {

                if (lastOperator == '+') {
                    accumulator += currentNumber;
                } else {
                    accumulator -= currentNumber;
                }

                lastOperator = ch;
                currentNumber = 0;
            }
        }

        if (lastOperator == '+') {
            accumulator += currentNumber;
        } else {
            accumulator -= currentNumber;
        }

        return String.valueOf(accumulator);
    }

    // ================= EXTRA FEATURES =================

    public double findSquare(double number) {
        return number * number;
    }

    public double findSquareRoot(double number) throws Exception {
        if (number < 0)
            throw new Exception("Cannot calculate square root of negative number");
        return Math.sqrt(number);
    }

    public String decimalToFraction(double decimal) {

        if (decimal == (long) decimal)
            return String.format("%d/1", (long) decimal);

        double tolerance = 1e-10;
        long numerator = 1;
        long denominator = 1;

        while (Math.abs(decimal - (double) numerator / denominator) > tolerance) {
            numerator++;
            denominator = (long) Math.round(numerator / decimal);
        }

        long gcd = gcd(numerator, denominator);
        return (numerator / gcd) + "/" + (denominator / gcd);
    }

    public double fractionToDecimal(int numerator, int denominator) throws Exception {
        if (denominator == 0)
            throw new Exception("Denominator cannot be zero");
        return (double) numerator / denominator;
    }

    private long gcd(long a, long b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    // ================= MAIN TEST =================

    public static void main(String[] args) throws Exception {

        Calculator calc = new Calculator();

        calc.appendNumber(5);
        calc.appendOperator('+');
        calc.appendNumber(3);

        System.out.println("Expression: " + calc.getExpression());
        System.out.println("Result: " + calc.calculate());

        calc.clear();
        calc.appendNumber(2);
        calc.appendOperator('*');
        calc.appendNumber(3);
        calc.appendOperator('+');
        calc.appendNumber(4);

        System.out.println("Expression: " + calc.getExpression());
        System.out.println("Result: " + calc.calculate());

        System.out.println("Square of 7: " + calc.findSquare(7));
        System.out.println("Square root of 16: " + calc.findSquareRoot(16));
        System.out.println("0.75 as fraction: " + calc.decimalToFraction(0.75));
        System.out.println("3/4 as decimal: " + calc.fractionToDecimal(3, 4));
    }
}