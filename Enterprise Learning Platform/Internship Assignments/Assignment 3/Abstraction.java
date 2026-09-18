abstract class Bank {

    abstract void getInterestRate();

    void bankInfo() {
        System.out.println("Welcome to Banking System");
    }
}

class SBI extends Bank {

    @Override
    void getInterestRate() {
        System.out.println("Interest Rate: 7%");
    }
}

public class Abstraction {
    public static void main(String[] args) {

        SBI bank = new SBI();

        bank.bankInfo();
        bank.getInterestRate();
    }
}