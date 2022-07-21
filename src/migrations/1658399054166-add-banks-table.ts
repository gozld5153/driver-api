import { MigrationInterface, QueryRunner } from "typeorm";

export class addBanksTable1658399054166 implements MigrationInterface {
    name = 'addBanksTable1658399054166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`banks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`bankName\` varchar(255) NOT NULL, \`bankAccount\` varchar(255) NOT NULL, \`userId\` int NULL, UNIQUE INDEX \`REL_efc3929d8c1573412824a2698c\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`banks\` ADD CONSTRAINT \`FK_efc3929d8c1573412824a2698c3\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`banks\` DROP FOREIGN KEY \`FK_efc3929d8c1573412824a2698c3\``);
        await queryRunner.query(`DROP INDEX \`REL_efc3929d8c1573412824a2698c\` ON \`banks\``);
        await queryRunner.query(`DROP TABLE \`banks\``);
    }

}
