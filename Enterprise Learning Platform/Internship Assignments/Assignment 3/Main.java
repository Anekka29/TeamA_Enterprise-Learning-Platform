class Payment {

    void pay() {
        System.out.println("Processing payment");
    }
}

class UpiPayment extends Payment {

    @Override
    void pay() {
        System.out.println("Payment done using UPI");
    }
}

class CardPayment extends Payment {

    @Override
    void pay() {
        System.out.println("Payment done using Card");
    }
}

public class Main {
    public static void main(String[] args) {

        Payment p;

        p = new UpiPayment();
        p.pay();

        p = new CardPayment();
        p.pay();
    }
}