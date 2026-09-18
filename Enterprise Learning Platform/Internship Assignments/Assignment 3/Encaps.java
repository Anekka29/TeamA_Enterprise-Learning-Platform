class Student {

    private String name;
    private int age;

    public void setDetails(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void displayDetails() {
        System.out.println("Student Name: " + name);
        System.out.println("Age: " + age);
    }
}

public class Encaps {
    public static void main(String[] args) {

        Student s1 = new Student();

        s1.setDetails("Chandni", 21);
        s1.displayDetails();
    }
}