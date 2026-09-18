class Employee {

    void companyName() {
        System.out.println("Company: OsopCoding");
    }
}

class Developer extends Employee {

    void work() {
        System.out.println("Developer writes Java code");
    }
}

public class Ineritance {
    public static void main(String[] args) {

        Developer d1 = new Developer();

        d1.companyName();
        d1.work();
    }
}